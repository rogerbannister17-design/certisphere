import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';

import { IDENTITY_AUDIT_EVENT_SINK, type IdentityAuditEventSink } from './audit-event.js';
import { IDENTITY_REPOSITORY, type IdentityRepository } from './identity.repository.js';
import { PASSWORD_HASHER, type PasswordHasher } from './password-hasher.js';
import type { IdentityUser } from '../domain/user.js';

const OWNER_ROLE_KEY = 'organisation.owner';
const OWNER_PERMISSIONS = [
  'identity.users.manage',
  'identity.roles.manage',
  'identity.invitations.manage',
  'organisation.read',
  'organisation.manage',
] as const;

export interface RegisterOrganisationCommand {
  readonly organisationName: string;
  readonly organisationSlug: string;
  readonly userName: string;
  readonly email: string;
  readonly password: string;
}

@Injectable()
export class RegisterOrganisationService {
  constructor(
    @Inject(IDENTITY_REPOSITORY) private readonly identity: IdentityRepository,
    @Inject(PASSWORD_HASHER) private readonly passwords: PasswordHasher,
    @Inject(IDENTITY_AUDIT_EVENT_SINK) private readonly auditEvents: IdentityAuditEventSink,
  ) {}

  async execute(command: RegisterOrganisationCommand): Promise<IdentityUser> {
    const organisationId = randomUUID();
    const userId = randomUUID();
    const passwordHash = await this.passwords.hash(command.password);
    const user = await this.identity.registerOrganisation({
      organisationId,
      userId,
      organisationName: command.organisationName,
      organisationSlug: command.organisationSlug,
      userName: command.userName,
      email: command.email.toLowerCase(),
      passwordHash,
      ownerRoleKey: OWNER_ROLE_KEY,
      permissions: OWNER_PERMISSIONS,
    });

    await this.auditEvents.record({
      organisationId,
      actorUserId: userId,
      action: 'identity.organisation.registered',
      resource: 'Organisation',
      resourceId: organisationId,
      metadata: { email: user.email },
    });

    return user;
  }
}
