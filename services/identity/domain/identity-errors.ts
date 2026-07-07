export abstract class IdentityError extends Error {
  protected constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCredentialsError extends IdentityError {
  constructor() {
    super('The supplied credentials are invalid.', 'INVALID_CREDENTIALS');
  }
}

export class InactiveUserError extends IdentityError {
  constructor() {
    super('The user account is not active.', 'INACTIVE_USER');
  }
}

export class InvalidRefreshTokenError extends IdentityError {
  constructor() {
    super('The refresh token is invalid, expired, or revoked.', 'INVALID_REFRESH_TOKEN');
  }
}

export class ForbiddenOrganisationAccessError extends IdentityError {
  constructor() {
    super('The principal is not authorised for this organisation.', 'FORBIDDEN_ORGANISATION_ACCESS');
  }
}
