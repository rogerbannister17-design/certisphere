export interface AuthenticatedSession {
  readonly organisationId: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: Date;
  readonly permissions: readonly string[];
}
