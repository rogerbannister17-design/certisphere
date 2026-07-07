export interface AccessTokenClaims {
  readonly organisationId: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly permissions: readonly string[];
}

export interface SignedAccessToken {
  readonly token: string;
  readonly expiresAt: Date;
}

export interface RefreshTokenSecret {
  readonly secret: string;
  readonly hash: string;
}

export interface TokenService {
  signAccessToken(claims: AccessTokenClaims): Promise<SignedAccessToken>;
  createRefreshToken(): RefreshTokenSecret;
  hashRefreshToken(secret: string): string;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
