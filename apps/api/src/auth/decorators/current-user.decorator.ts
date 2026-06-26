import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@kursly/shared';

/** Injects the authenticated user's JWT payload into a controller handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
