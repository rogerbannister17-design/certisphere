import { Inject, Injectable } from '@nestjs/common';

import { IDENTITY_AUDIT_EVENT_SINK, type IdentityAuditEventSink } from './audit-event.js';
import { IDENTITY_REPOSITORY, type IdentityRepository } from './identity.repository.js';
import { PASSWORD_HASHER, type PasswordHasher } from './password-hasher.js';
import { TOKEN_SERVICE, type TokenService } from './token-service.js';
import type { AuthenticatedSession } from '../domain/authenticated-session.js';
import { InactiveUserError, InvalidCredentialsError } from '../domain/identity-errors.js';

export interface LoginCommand {
  readonly organisationSlug: string;
  readonly email: string;
  readonly password: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

@Injectable()
export class LoginService {
  constructor(
    @Inject(IDENTITY_REPOSITORY) private readonly identity: IdentityRepository,
    @Inject(PASSWORD_HASHER) private readonly passwords: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(IDENTITY_AUDIT_EVENT_SINK) private readonly auditEvents: IdentityAuditEventSink,
  ) {}

  async execute(command: LoginCommand): Promise<AuthenticatedSession> {
    const user = await this.identity.findActiveUserForLogin({
      organisationSlug: command.organisationSlug,
      email: command.email.toLowerCase(),
    });

    if (user === null) {
      throw new InvalidCredentialsError();
    }

    if (user.status !== 'ACTIVE' || user.deletedAt !== null) {
      throw new InactiveUserError();
    }

    const passwordMatches = await this.passwords.verify(user.passwordHash, command.password);

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const permissions = await this.identity.listPermissionKeys({
      organisationId: user.organisationId,
      userId: user.id,
    });
    const refreshToken = this.tokens.createRefreshToken();
    const refreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    const session = await this.identity.createSession({
      organisationId: user.organisationId,
      userId: user.id,
      refreshTokenHash: refreshToken.hash,
      expiresAt: refreshExpiresAt,
      ...(command.ipAddress === undefined ? {} : { ipAddress: command.ipAddress }),
      ...(command.userAgent === undefined ? {} : { userAgent: command.userAgent }),
    });
    const accessToken = await this.tokens.signAccessToken({
      organisationId: user.organisationId,
      userId: user.id,
      sessionId: session.sessionId,
      permissions,
    });

    await this.auditEvents.record({
      organisationId: user.organisationId,
      actorUserId: user.id,
      action: 'identity.session.created',
      resource: 'Session',
      resourceId: session.sessionId,
      metadata: { email: user.email },
    });

    return {
      organisationId: user.organisationId,
      userId: user.id,
      sessionId: session.sessionId,
      accessToken: accessToken.token,
      refreshToken: refreshToken.secret,
      expiresAt: accessToken.expiresAt,
      permissions,
    };
  }
}
