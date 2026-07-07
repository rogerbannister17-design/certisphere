import { describe, expect, it } from 'vitest';

import type { IdentityAuditEventSink } from '../application/audit-event.js';
import type { IdentityRepository } from '../application/identity.repository.js';
import { LoginService } from '../application/login.service.js';
import type { PasswordHasher } from '../application/password-hasher.js';
import type { TokenService } from '../application/token-service.js';

describe('LoginService', () => {
  it('issues access and refresh tokens for an active user with valid credentials', async () => {
    const repository: IdentityRepository = {
      registerOrganisation() {
        return Promise.reject(new Error('Not used in this test.'));
      },
      findActiveUserForLogin() {
        return Promise.resolve({
          id: '22222222-2222-4222-8222-222222222222',
          organisationId: '11111111-1111-4111-8111-111111111111',
          email: 'owner@example.com',
          name: 'Owner',
          passwordHash: 'argon2id-hash',
          status: 'ACTIVE',
          createdBy: '22222222-2222-4222-8222-222222222222',
          updatedBy: '22222222-2222-4222-8222-222222222222',
          createdAt: new Date('2026-07-07T00:00:00.000Z'),
          updatedAt: new Date('2026-07-07T00:00:00.000Z'),
          deletedAt: null,
          version: 1,
        });
      },
      listPermissionKeys() {
        return Promise.resolve(['identity.users.manage']);
      },
      createSession() {
        return Promise.resolve({ sessionId: '33333333-3333-4333-8333-333333333333' });
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
        return Promise.resolve(true);
      },
    };
    const tokens: TokenService = {
      signAccessToken() {
        return Promise.resolve({
          token: 'jwt',
          expiresAt: new Date('2026-07-07T00:15:00.000Z'),
        });
      },
      createRefreshToken() {
        return { secret: 'refresh-token', hash: 'refresh-token-hash' };
      },
      hashRefreshToken(secret) {
        return `hash:${secret}`;
      },
    };
    const auditEvents: IdentityAuditEventSink = {
      record() {
        return Promise.resolve();
      },
    };
    const service = new LoginService(repository, passwords, tokens, auditEvents);

    const session = await service.execute({
      organisationSlug: 'acme',
      email: 'OWNER@EXAMPLE.COM',
      password: 'correct-password',
    });

    expect(session.accessToken).toBe('jwt');
    expect(session.refreshToken).toBe('refresh-token');
    expect(session.permissions).toEqual(['identity.users.manage']);
  });
});
