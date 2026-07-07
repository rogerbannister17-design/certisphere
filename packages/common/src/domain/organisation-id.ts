import { InvalidIdentifierError } from './errors.js';

const uuidExpression = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class OrganisationId {
  private constructor(readonly value: string) {}

  static from(value: string): OrganisationId {
    if (!uuidExpression.test(value)) {
      throw new InvalidIdentifierError(value);
    }

    return new OrganisationId(value);
  }
}
