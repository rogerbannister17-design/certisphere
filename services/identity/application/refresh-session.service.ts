import { Inject, Injectable } from '@nestjs/common';

import { IDENTITY_AUDIT_EVENT_SINK, type IdentityAuditEventSink } from './audit-event.js';
import {
  IDENTITY_REPOSITORY,
  type IdentityRepository,
  type StoredRefreshToken,
} from './identity.repository.js';
import { TOKEN_SERVICE, type TokenService } from './token-service.js';
import type { AuthenticatedSession } from '../domain/authenticated-session.js';
import { InvalidRefreshTokenError } from '../domain/identity-errors.js';

export interface RefreshSessionCommand {
  readonly refreshToken: string;
}

@Injectable()
export class RefreshSessionService {
  constructor(
    @Inject(IDENTITY_REPOSITORY) private readonly identity: IdentityRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(IDENTITY_AUDIT_EVENT_SINK) private readonly auditEvents: IdentityAuditEventSink,
  ) {}

  async execute(command: RefreshSessionCommand): Promise<AuthenticatedSession> {
    const previousTokenHash = this.tokens.hashRefreshToken(command.refreshToken);
    const storedToken = await this.identity.findRefreshToken(previousTokenHash);

    if (!isUsableRefreshToken(storedToken)) {
      throw new InvalidRefreshTokenError();
    }

    const nextRefreshToken = this.tokens.createRefreshToken();
    const refreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    const rotatedToken = await this.identity.rotateRefreshToken({
      previousTokenHash,
      nextTokenHash: nextRefreshToken.hash,
      expiresAt: refreshExpiresAt,
    });
    const permissions = await this.identity.listPermissionKeys({
      organisationId: rotatedToken.organisationId,
      userId: rotatedToken.userId,
    });
    const accessToken = await this.tokens.signAccessToken({
      organisationId: rotatedToken.organisationId,
      userId: rotatedToken.userId,
      sessionId: rotatedToken.sessionId,
      permissions,
    });

    await this.auditEvents.record({
      organisationId: rotatedToken.organisationId,
      actorUserId: rotatedToken.userId,
      action: 'identity.session.refreshed',
      resource: 'Session',
      resourceId: rotatedToken.sessionId,
    });

    return {
      organisationId: rotatedToken.organisationId,
      userId: rotatedToken.userId,
      sessionId: rotatedToken.sessionId,
      accessToken: accessToken.token,
      refreshToken: nextRefreshToken.secret,
      expiresAt: accessToken.expiresAt,
      permissions,
    };
  }
}

function isUsableRefreshToken(
  storedToken: StoredRefreshToken | null,
): storedToken is StoredRefreshToken {
  return storedToken?.revokedAt === null && storedToken.expiresAt.getTime() > Date.now();
}
