import type { IdentityUser } from '../domain/user.js';

export interface LoginLookup {
  readonly organisationSlug: string;
  readonly email: string;
}

export interface PermissionLookup {
  readonly organisationId: string;
  readonly userId: string;
}

export interface CreateSessionInput {
  readonly organisationId: string;
  readonly userId: string;
  readonly refreshTokenHash: string;
  readonly expiresAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface StoredRefreshToken {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}

export interface RotateRefreshTokenInput {
  readonly previousTokenHash: string;
  readonly nextTokenHash: string;
  readonly expiresAt: Date;
}

export interface CreateInvitationInput {
  readonly organisationId: string;
  readonly email: string;
  readonly roleKey: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly actorUserId: string;
}

export interface InvitationRecord {
  readonly id: string;
  readonly organisationId: string;
  readonly email: string;
  readonly roleKey: string;
  readonly expiresAt: Date;
}

export interface RegisterOrganisationInput {
  readonly organisationId: string;
  readonly userId: string;
  readonly organisationName: string;
  readonly organisationSlug: string;
  readonly userName: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly ownerRoleKey: string;
  readonly permissions: readonly string[];
}

export interface IdentityRepository {
  registerOrganisation(input: RegisterOrganisationInput): Promise<IdentityUser>;
  findActiveUserForLogin(lookup: LoginLookup): Promise<IdentityUser | null>;
  listPermissionKeys(lookup: PermissionLookup): Promise<readonly string[]>;
  createSession(input: CreateSessionInput): Promise<{ readonly sessionId: string }>;
  findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null>;
  rotateRefreshToken(input: RotateRefreshTokenInput): Promise<StoredRefreshToken>;
  createInvitation(input: CreateInvitationInput): Promise<InvitationRecord>;
}

export const IDENTITY_REPOSITORY = Symbol('IDENTITY_REPOSITORY');
