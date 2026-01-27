import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserPayload as UserPayloadType } from '../types/user-payload';

export const UserPayloadDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayloadType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserPayloadType;
  },
);
