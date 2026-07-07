import { describe, expect, it } from 'vitest';

import { CreateOrganisationService } from '../application/create-organisation.service.js';
import type { OrganisationRepository } from '../application/organisation.repository.js';

describe('CreateOrganisationService', () => {
  it('delegates organisation creation to the repository boundary', async () => {
    const repository: OrganisationRepository = {
      create(input) {
        const now = new Date('2026-07-07T00:00:00.000Z');

        return Promise.resolve({
          id: '11111111-1111-4111-8111-111111111111',
          organisationId: '11111111-1111-4111-8111-111111111111',
          name: input.name,
          slug: input.slug,
          createdBy: input.actorUserId,
          updatedBy: input.actorUserId,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          version: 1,
        });
      },
      findById() {
        return Promise.resolve(null);
      },
    };
    const service = new CreateOrganisationService(repository);

    const organisation = await service.execute({
      name: 'Acme Quality',
      slug: 'acme-quality',
      actorUserId: '22222222-2222-4222-8222-222222222222',
    });

    expect(organisation.organisationId).toBe('11111111-1111-4111-8111-111111111111');
    expect(organisation.name).toBe('Acme Quality');
  });
});
