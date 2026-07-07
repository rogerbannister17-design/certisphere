import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateInvitationInput,
  CreateSessionInput,
  IdentityRepository,
  InvitationRecord,
  LoginLookup,
  PermissionLookup,
  RegisterOrganisationInput,
  RotateRefreshTokenInput,
  StoredRefreshToken,
} from '../application/identity.repository.js';
import type { IdentityUser } from '../domain/user.js';
import { PRISMA_CLIENT, type CertispherePrismaClient } from './prisma-tokens.js';

@Injectable()
export class PrismaIdentityRepository implements IdentityRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: CertispherePrismaClient) {}

  async registerOrganisation(input: RegisterOrganisationInput): Promise<IdentityUser> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.organisation.create({
        data: {
          id: input.organisationId,
          organisationId: input.organisationId,
          name: input.organisationName,
          slug: input.organisationSlug,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });

      const user = await transaction.user.create({
        data: {
          id: input.userId,
          organisationId: input.organisationId,
          email: input.email,
          name: input.userName,
          passwordHash: input.passwordHash,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });

      await transaction.organisationMembership.create({
        data: {
          organisationId: input.organisationId,
          userId: input.userId,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });

      const role = await transaction.role.create({
        data: {
          organisationId: input.organisationId,
          key: input.ownerRoleKey,
          name: 'Organisation Owner',
          description: 'Full administrative access for the organisation.',
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });

      await transaction.userRole.create({
        data: {
          organisationId: input.organisationId,
          userId: input.userId,
          roleId: role.id,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });

      for (const permissionKey of input.permissions) {
        const permission = await transaction.permission.create({
          data: {
            organisationId: input.organisationId,
            key: permissionKey,
            description: `Permission ${permissionKey}`,
            createdBy: input.userId,
            updatedBy: input.userId,
          },
        });

        await transaction.rolePermission.create({
          data: {
            organisationId: input.organisationId,
            roleId: role.id,
            permissionId: permission.id,
            createdBy: input.userId,
            updatedBy: input.userId,
          },
        });
      }

      return user;
    });
  }

  async findActiveUserForLogin(lookup: LoginLookup): Promise<IdentityUser | null> {
    return this.prisma.user.findFirst({
      where: {
        email: lookup.email,
        deletedAt: null,
        organisation: {
          slug: lookup.organisationSlug,
          deletedAt: null,
        },
      },
    });
  }

  async listPermissionKeys(lookup: PermissionLookup): Promise<readonly string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        organisationId: lookup.organisationId,
        userId: lookup.userId,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return [
      ...new Set(
        userRoles.flatMap((userRole) =>
          userRole.role.permissions.map((rolePermission) => rolePermission.permission.key),
        ),
      ),
    ];
  }

  async createSession(input: CreateSessionInput): Promise<{ readonly sessionId: string }> {
    const session = await this.prisma.session.create({
      data: {
        organisationId: input.organisationId,
        userId: input.userId,
        ...(input.ipAddress === undefined ? {} : { ipAddress: input.ipAddress }),
        ...(input.userAgent === undefined ? {} : { userAgent: input.userAgent }),
        expiresAt: input.expiresAt,
        createdBy: input.userId,
        updatedBy: input.userId,
        refreshTokens: {
          create: {
            organisationId: input.organisationId,
            userId: input.userId,
            tokenHash: input.refreshTokenHash,
            expiresAt: input.expiresAt,
            createdBy: input.userId,
            updatedBy: input.userId,
          },
        },
      },
    });

    return { sessionId: session.id };
  }

  async findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async rotateRefreshToken(input: RotateRefreshTokenInput): Promise<StoredRefreshToken> {
    return this.prisma.$transaction(async (transaction) => {
      const previousToken = await transaction.refreshToken.update({
        where: { tokenHash: input.previousTokenHash },
        data: { revokedAt: new Date() },
      });

      return transaction.refreshToken.create({
        data: {
          organisationId: previousToken.organisationId,
          userId: previousToken.userId,
          sessionId: previousToken.sessionId,
          tokenHash: input.nextTokenHash,
          expiresAt: input.expiresAt,
          createdBy: previousToken.userId,
          updatedBy: previousToken.userId,
        },
      });
    });
  }

  async createInvitation(input: CreateInvitationInput): Promise<InvitationRecord> {
    return this.prisma.invitation.create({
      data: {
        organisationId: input.organisationId,
        email: input.email,
        roleKey: input.roleKey,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        createdBy: input.actorUserId,
        updatedBy: input.actorUserId,
      },
    });
  }
}
