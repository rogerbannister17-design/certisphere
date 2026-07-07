import { Inject, Injectable } from '@nestjs/common';

import { IDENTITY_AUDIT_EVENT_SINK, type IdentityAuditEventSink } from './audit-event.js';
import { IDENTITY_REPOSITORY, type IdentityRepository, type InvitationRecord } from './identity.repository.js';
import { TOKEN_SERVICE, type TokenService } from './token-service.js';

export interface CreateInvitationCommand {
  readonly organisationId: string;
  readonly actorUserId: string;
  readonly email: string;
  readonly roleKey: string;
}

export interface CreatedInvitation {
  readonly invitation: InvitationRecord;
  readonly oneTimeToken: string;
}

@Injectable()
export class InvitationService {
  constructor(
    @Inject(IDENTITY_REPOSITORY) private readonly identity: IdentityRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(IDENTITY_AUDIT_EVENT_SINK) private readonly auditEvents: IdentityAuditEventSink,
  ) {}

  async create(command: CreateInvitationCommand): Promise<CreatedInvitation> {
    const invitationToken = this.tokens.createRefreshToken();
    const invitation = await this.identity.createInvitation({
      organisationId: command.organisationId,
      email: command.email.toLowerCase(),
      roleKey: command.roleKey,
      tokenHash: invitationToken.hash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      actorUserId: command.actorUserId,
    });

    await this.auditEvents.record({
      organisationId: command.organisationId,
      actorUserId: command.actorUserId,
      action: 'identity.invitation.created',
      resource: 'Invitation',
      resourceId: invitation.id,
      metadata: { email: invitation.email, roleKey: invitation.roleKey },
    });

    return {
      invitation,
      oneTimeToken: invitationToken.secret,
    };
  }
}
