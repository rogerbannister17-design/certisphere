import { Inject, Injectable } from '@nestjs/common';

import {
  ORGANISATION_REPOSITORY,
  type CreateOrganisationInput,
  type OrganisationRepository,
} from './organisation.repository.js';
import type { Organisation } from '../domain/organisation.js';

@Injectable()
export class CreateOrganisationService {
  constructor(
    @Inject(ORGANISATION_REPOSITORY)
    private readonly organisations: OrganisationRepository,
  ) {}

  async execute(input: CreateOrganisationInput): Promise<Organisation> {
    return this.organisations.create(input);
  }
}
