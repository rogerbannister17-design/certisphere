import type { Organisation } from '../domain/organisation.js';

export interface CreateOrganisationInput {
  readonly name: string;
  readonly slug: string;
  readonly actorUserId: string;
}

export interface OrganisationRepository {
  create(input: CreateOrganisationInput): Promise<Organisation>;
  findById(organisationId: string): Promise<Organisation | null>;
}

export const ORGANISATION_REPOSITORY = Symbol('ORGANISATION_REPOSITORY');
