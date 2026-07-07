import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { type AuthenticatedRequest } from './authenticated-principal.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorisationHeader = request.headers.authorization;
    const configuredToken = process.env.API_GATEWAY_INTERNAL_TOKEN;

    if (configuredToken === undefined || configuredToken.length < 32) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_NOT_CONFIGURED',
        message: 'API gateway authentication is not configured.',
      });
    }

    const bearerToken = this.extractBearerToken(authorisationHeader);

    if (bearerToken !== configuredToken) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_FAILED',
        message: 'Valid bearer authentication is required.',
      });
    }

    request.principal = {
      subject: 'api-gateway-internal-client',
      permissions: ['platform.health.read'],
    };

    return true;
  }

  private extractBearerToken(header: string | string[] | undefined): string {
    if (typeof header !== 'string') {
      return '';
    }

    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || token === undefined) {
      return '';
    }

    return token;
  }
}
