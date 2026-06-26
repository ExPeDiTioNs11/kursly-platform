import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logs one structured line per HTTP request with method, path, status code and
 * latency. Keeps a minimal, dependency-free observability baseline.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.log(req.method, req.originalUrl, res.statusCode, start),
        error: (err: { status?: number }) =>
          this.log(req.method, req.originalUrl, err?.status ?? 500, start),
      }),
    );
  }

  private log(method: string, url: string, status: number, start: number): void {
    const ms = Date.now() - start;
    this.logger.log(`${method} ${url} ${status} ${ms}ms`);
  }
}
