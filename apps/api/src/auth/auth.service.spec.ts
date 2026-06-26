import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@kursly/shared';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

function makePrisma() {
  return {
    user: { findUnique: jest.fn(), create: jest.fn() },
    refreshToken: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
}

function makeService(prisma: ReturnType<typeof makePrisma>) {
  const jwt = { signAsync: jest.fn().mockResolvedValue('token'), verifyAsync: jest.fn() };
  const config = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
    get: jest.fn().mockReturnValue('15m'),
  };
  const service = new AuthService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
    config as unknown as ConfigService,
  );
  return { service, jwt, config };
}

describe('AuthService', () => {
  it('rejects registration when the email is already taken', async () => {
    const prisma = makePrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    const { service } = makeService(prisma);

    await expect(
      service.register({ email: 'a@b.com', password: 'x', name: 'A' } as RegisterDto),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects login for an unknown user', async () => {
    const prisma = makePrisma();
    prisma.user.findUnique.mockResolvedValue(null);
    const { service } = makeService(prisma);

    await expect(
      service.login({ email: 'a@b.com', password: 'x' } as LoginDto),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('revokes the whole token family when a revoked refresh token is replayed', async () => {
    const prisma = makePrisma();
    const rawToken = 'stolen.refresh.token';
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const { service, jwt } = makeService(prisma);

    jwt.verifyAsync.mockResolvedValue({ sub: 'u1', email: 'a@b.com', role: Role.STUDENT });
    // No active token matches, but a revoked record does -> reuse detected.
    prisma.refreshToken.findMany
      .mockResolvedValueOnce([]) // active tokens
      .mockResolvedValueOnce([{ id: 't1', tokenHash }]); // revoked tokens

    await expect(service.refresh(rawToken)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1', revokedAt: null } }),
    );
  });
});
