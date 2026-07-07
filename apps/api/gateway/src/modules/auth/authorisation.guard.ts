import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type AuthenticatedRequest } from './authenticated-principal.js';
import { REQUIRED_PERMISSIONS_KEY } from './required-permissions.decorator.js';

@Injectable()
export class AuthorisationGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<readonly string[] | undefined>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [];

    if (requiredPermissions.length === 0) {
      throw new ForbiddenException({
        code: 'AUTHORISATION_POLICY_MISSING',
        message: 'Endpoint authorisation policy is not configured.',
      });
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const permissions = request.principal?.permissions ?? [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException({
        code: 'AUTHORISATION_FAILED',
        message: 'The authenticated principal is not authorised for this endpoint.',
      });
    }

    return true;
  }
}
