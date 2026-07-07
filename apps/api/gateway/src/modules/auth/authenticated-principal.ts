export interface AuthenticatedPrincipal {
  readonly subject: string;
  readonly organisationId: string;
  readonly sessionId: string;
  readonly permissions: readonly string[];
}

export interface AuthenticatedRequest {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly body?: unknown;
  principal?: AuthenticatedPrincipal;
}
