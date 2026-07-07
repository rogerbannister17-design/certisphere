export type UserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface IdentityUser {
  readonly id: string;
  readonly organisationId: string;
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly status: UserStatus;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly version: number;
}
