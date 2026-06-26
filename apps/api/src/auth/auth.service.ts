import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@kursly/shared';
import type { AuthResponse, AuthTokens, JwtPayload, PublicUser } from '@kursly/shared';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { User } from '@prisma/client';

const SALT_ROUNDS = 10;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role ?? Role.STUDENT,
      },
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find a stored, non-revoked, non-expired token matching this user.
    const stored = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    const match = await this.findMatchingToken(stored, refreshToken);
    if (!match) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate: revoke the used token and issue a fresh pair.
    await this.prisma.refreshToken.update({
      where: { id: match.id },
      data: { revokedAt: new Date() },
    });
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const stored = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });
    const match = await this.findMatchingToken(stored, refreshToken);
    if (match) {
      await this.prisma.refreshToken.update({
        where: { id: match.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  private async findMatchingToken(
    stored: { id: string; tokenHash: string }[],
    rawToken: string,
  ): Promise<{ id: string } | null> {
    for (const token of stored) {
      if (await bcrypt.compare(rawToken, token.tokenHash)) {
        return { id: token.id };
      }
    }
    return null;
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role as Role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
