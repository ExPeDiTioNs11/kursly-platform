import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/**
 * Translates known Prisma errors into clean HTTP responses instead of leaking a
 * raw 500. Anything unrecognised is rethrown so the default exception filter can
 * handle it.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    const { status, message } = this.map(exception);
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Unmapped Prisma error ${exception.code}: ${exception.message}`);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
    });
  }

  private map(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (exception.code) {
      // Unique constraint violation.
      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        return {
          status: HttpStatus.CONFLICT,
          message: target ? `A record with this ${target} already exists` : 'Duplicate record',
        };
      }
      // Foreign key constraint failed.
      case 'P2003':
        return { status: HttpStatus.BAD_REQUEST, message: 'Related record does not exist' };
      // Record required for the operation was not found.
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, message: 'Record not found' };
      default:
        return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
    }
  }
}
