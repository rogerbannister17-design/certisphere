export abstract class DocumentDomainError extends Error {
  constructor(message: string, code: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }

  readonly code: string;
}

export class InvalidDocumentStateTransitionError extends DocumentDomainError {
  constructor(from: string, to: string) {
    super(
      `Invalid lifecycle transition from ${from} to ${to}.`,
      'INVALID_DOCUMENT_STATE_TRANSITION',
    );
  }
}

export class InvalidDocumentValueError extends DocumentDomainError {
  constructor(message: string) {
    super(message, 'INVALID_DOCUMENT_VALUE');
  }
}

export class InvalidDocumentIdentifierError extends DocumentDomainError {
  constructor(value: string) {
    super(`Invalid document domain identifier: ${value}`, 'INVALID_DOCUMENT_IDENTIFIER');
  }
}

export class DocumentInvariantViolationError extends DocumentDomainError {
  constructor(message: string) {
    super(message, 'DOCUMENT_INVARIANT_VIOLATION');
  }
}
