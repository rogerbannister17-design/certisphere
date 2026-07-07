import { describe, expect, it } from 'vitest';

import type { IdentityAuditEventSink } from '../application/audit-event.js';
import type { IdentityRepository } from '../application/identity.repository.js';
import type { PasswordHasher } from '../application/password-hasher.js';
import { RegisterOrganisationService } from '../application/register-organisation.service.js';

describe('RegisterOrganisationService', () => {
  it('creates an organisation owner with an Argon2 password hash boundary', async () => {
    let capturedPasswordHash = '';
    const repository: IdentityRepository = {
      registerOrganisation(input) {
        capturedPasswordHash = input.passwordHash;
        const now = new Date('2026-07-07T00:00:00.000Z');

        return Promise.resolve({
          id: input.userId,
          organisationId: input.organisationId,
          email: input.email,
          name: input.userName,
          passwordHash: input.passwordHash,
          status: 'ACTIVE',
          createdBy: input.userId,
          updatedBy: input.userId,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          version: 1,
        });
      },
      findActiveUserForLogin() {
        return Promise.resolve(null);
      },
      listPermissionKeys() {
        return Promise.resolve([]);
      },
      createSession() {
        return Promise.reject(new Error('Not used in this test.'));
      },
      findRefreshToken() {
        return Promise.resolve(null);
      },
      rotateRefreshToken() {
        return Promise.reject(new Error('Not used in this test.'));
      },
      createInvitation() {
        return Promise.reject(new Error('Not used in this test.'));
      },
    };
    const passwords: PasswordHasher = {
      hash() {
        return Promise.resolve('argon2id-hash');
      },
      verify() {
        return Promise.resolve(false);
      },
    };
    const auditEvents: IdentityAuditEventSink = {
      record() {
        return Promise.resolve();
      },
    };
    const service = new RegisterOrganisationService(repository, passwords, auditEvents);

    const user = await service.execute({
      organisationName: 'Acme Quality',
      organisationSlug: 'acme-quality',
      userName: 'Owner',
      email: 'OWNER@EXAMPLE.COM',
      password: 'correct-password',
    });

    expect(user.email).toBe('owner@example.com');
    expect(capturedPasswordHash).toBe('argon2id-hash');
  });
});
