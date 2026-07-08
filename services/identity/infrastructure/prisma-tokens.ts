import type { IdentityAuditEvent } from '../application/audit-event.js';
import type { InvitationRecord, StoredRefreshToken } from '../application/identity.repository.js';
import type { IdentityUser } from '../domain/user.js';

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');

interface OrganisationRecord {
  readonly id: string;
}

interface RoleRecord {
  readonly id: string;
}

interface PermissionRecord {
  readonly id: string;
  readonly key: string;
}

interface SessionRecord {
  readonly id: string;
}

interface UserRoleWithPermissions {
  readonly role: {
    readonly permissions: readonly {
      readonly permission: PermissionRecord;
    }[];
  };
}

interface CreateDelegate<TResult> {
  create(args: unknown): Promise<TResult>;
}

interface UserDelegate extends CreateDelegate<IdentityUser> {
  findFirst(args: unknown): Promise<IdentityUser | null>;
}

interface UserRoleDelegate extends CreateDelegate<unknown> {
  findMany(args: unknown): Promise<readonly UserRoleWithPermissions[]>;
}

interface RefreshTokenDelegate extends CreateDelegate<StoredRefreshToken> {
  findUnique(args: unknown): Promise<StoredRefreshToken | null>;
  update(args: unknown): Promise<StoredRefreshToken>;
}

interface AuditEventDelegate {
  create(args: {
    readonly data: {
      readonly organisationId: string;
      readonly actorUserId: string;
      readonly action: string;
      readonly resource: string;
      readonly resourceId?: string;
      readonly metadata?: IdentityAuditEvent['metadata'];
      readonly createdBy: string;
      readonly updatedBy: string;
    };
  }): Promise<unknown>;
}

export interface CertispherePrismaTransaction {
  readonly organisation: CreateDelegate<OrganisationRecord>;
  readonly user: UserDelegate;
  readonly organisationMembership: CreateDelegate<unknown>;
  readonly role: CreateDelegate<RoleRecord>;
  readonly userRole: UserRoleDelegate;
  readonly permission: CreateDelegate<PermissionRecord>;
  readonly rolePermission: CreateDelegate<unknown>;
  readonly refreshToken: RefreshTokenDelegate;
}

export interface CertispherePrismaClient extends CertispherePrismaTransaction {
  $transaction<TResult>(
    handler: (transaction: CertispherePrismaTransaction) => Promise<TResult>,
  ): Promise<TResult>;
  readonly session: CreateDelegate<SessionRecord>;
  readonly invitation: CreateDelegate<InvitationRecord>;
  readonly auditEvent: AuditEventDelegate;
}
