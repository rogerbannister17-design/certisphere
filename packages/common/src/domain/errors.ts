export abstract class DomainError extends Error {
  protected constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidIdentifierError extends DomainError {
  constructor(value: string) {
    super(`Invalid identifier: ${value}`, 'INVALID_IDENTIFIER');
  }
}
