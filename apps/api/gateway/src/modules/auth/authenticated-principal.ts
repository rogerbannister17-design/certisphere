export interface AuthenticatedPrincipal {
  readonly subject: string;
  readonly permissions: readonly string[];
}

export interface AuthenticatedRequest {
  readonly headers: Record<string, string | string[] | undefined>;
  principal?: AuthenticatedPrincipal;
}
