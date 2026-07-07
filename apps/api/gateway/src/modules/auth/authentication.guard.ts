import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtVerify } from 'jose';

import { type AuthenticatedRequest } from './authenticated-principal.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorisationHeader = request.headers.authorization;
    const configuredSecret = process.env.JWT_ACCESS_TOKEN_SECRET;

    if (configuredSecret === undefined || configuredSecret.length < 32) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_NOT_CONFIGURED',
        message: 'JWT authentication is not configured.',
      });
    }

    const bearerToken = this.extractBearerToken(authorisationHeader);

    if (bearerToken === '') {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_FAILED',
        message: 'Valid bearer authentication is required.',
      });
    }

    try {
      const verified = await jwtVerify(bearerToken, new TextEncoder().encode(configuredSecret), {
        issuer: 'certisphere-api',
        audience: 'certisphere',
      });
      const organisationId = verified.payload.organisationId;
      const sessionId = verified.payload.sessionId;
      const permissions = verified.payload.permissions;

      if (
        verified.payload.sub === undefined ||
        typeof organisationId !== 'string' ||
        typeof sessionId !== 'string' ||
        !Array.isArray(permissions) ||
        !permissions.every((permission): permission is string => typeof permission === 'string')
      ) {
        throw new Error('JWT claims are incomplete.');
      }

      request.principal = {
        subject: verified.payload.sub,
        organisationId,
        sessionId,
        permissions,
      };
    } catch {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_FAILED',
        message: 'Valid bearer authentication is required.',
      });
    }

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
