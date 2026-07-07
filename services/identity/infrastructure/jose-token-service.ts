import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { SignJWT } from 'jose';

import type {
  AccessTokenClaims,
  RefreshTokenSecret,
  SignedAccessToken,
  TokenService,
} from '../application/token-service.js';

const ACCESS_TOKEN_TTL_SECONDS = 900;

@Injectable()
export class JoseTokenService implements TokenService {
  private readonly secret: Uint8Array;

  constructor() {
    const configuredSecret = process.env.JWT_ACCESS_TOKEN_SECRET;

    if (configuredSecret === undefined || configuredSecret.length < 32) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET must be configured with at least 32 characters.');
    }

    this.secret = new TextEncoder().encode(configuredSecret);
  }

  async signAccessToken(claims: AccessTokenClaims): Promise<SignedAccessToken> {
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
    const token = await new SignJWT({
      organisationId: claims.organisationId,
      permissions: claims.permissions,
      sessionId: claims.sessionId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(claims.userId)
      .setIssuer('certisphere-api')
      .setAudience('certisphere')
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(this.secret);

    return { token, expiresAt };
  }

  createRefreshToken(): RefreshTokenSecret {
    const secret = randomBytes(48).toString('base64url');

    return {
      secret,
      hash: this.hashRefreshToken(secret),
    };
  }

  hashRefreshToken(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }
}
