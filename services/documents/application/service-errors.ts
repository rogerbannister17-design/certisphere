export abstract class DocumentApplicationServiceError extends Error {
  protected constructor(message: string, readonly code: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class DocumentResourceNotFoundError extends DocumentApplicationServiceError {
  constructor(resource: string) {
    super(`${resource} was not found.`, 'DOCUMENT_RESOURCE_NOT_FOUND');
  }
}

export class DocumentTenantMismatchError extends DocumentApplicationServiceError {
  constructor() {
    super('The requested resource does not belong to the selected organisation.', 'DOCUMENT_TENANT_MISMATCH');
  }
}

export class DuplicateDocumentNumberError extends DocumentApplicationServiceError {
  constructor() {
    super('Document number is already in use for this organisation.', 'DUPLICATE_DOCUMENT_NUMBER');
  }
}

export class DocumentOwnershipMismatchError extends DocumentApplicationServiceError {
  constructor() {
    super(
      'Controlled information owner does not match the required owner.',
      'DOCUMENT_OWNER_MISMATCH',
    );
  }
}

export class DocumentSearchLimitError extends DocumentApplicationServiceError {
  constructor() {
    super('Search limit must be between 1 and 100.', 'DOCUMENT_SEARCH_LIMIT_INVALID');
  }
}
