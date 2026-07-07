import { describe, expect, it } from 'vitest';

import { InvalidIdentifierError } from './errors.js';
import { OrganisationId } from './organisation-id.js';

describe('OrganisationId', () => {
  it('creates an organisation identifier from a UUID', () => {
    const organisationId = OrganisationId.from('11111111-1111-4111-8111-111111111111');

    expect(organisationId.value).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('rejects invalid identifiers', () => {
    expect(() => OrganisationId.from('not-a-uuid')).toThrow(InvalidIdentifierError);
  });
});
