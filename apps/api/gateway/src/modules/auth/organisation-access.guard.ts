import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { type AuthenticatedRequest } from './authenticated-principal.js';

@Injectable()
export class OrganisationAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const requestedOrganisationId = this.readOrganisationId(request.body);

    if (requestedOrganisationId === undefined) {
      throw new ForbiddenException({
        code: 'ORGANISATION_CONTEXT_MISSING',
        message: 'Organisation context is required for this endpoint.',
      });
    }

    if (request.principal?.organisationId !== requestedOrganisationId) {
      throw new ForbiddenException({
        code: 'ORGANISATION_ACCESS_DENIED',
        message: 'The authenticated principal cannot access this organisation.',
      });
    }

    return true;
  }

  private readOrganisationId(body: unknown): string | undefined {
    if (typeof body !== 'object' || body === null || !('organisationId' in body)) {
      return undefined;
    }

    const organisationId = body.organisationId;
    return typeof organisationId === 'string' ? organisationId : undefined;
  }
}
