import 'reflect-metadata';

import { type INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SignJWT } from 'jose';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type HealthResponseDto } from '../src/modules/health/dto/health-response.dto.js';
import { AppModule } from '../src/modules/app.module.js';

describe('Health endpoint', () => {
  let app: INestApplication;
  const jwtSecret = '12345678901234567890123456789012';

  beforeEach(async () => {
    process.env.JWT_ACCESS_TOKEN_SECRET = jwtSecret;

    const moduleReference = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleReference.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    await app.init();
    await app.listen(0);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns the documented health response', async () => {
    const accessToken = await createAccessToken(jwtSecret);
    const response = await fetch(`${await app.getUrl()}/v1/health`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'x-correlation-id': 'test-correlation-id',
      },
    });
    const responseBody = await readHealthResponse(response);

    expect(response.status).toBe(200);
    expect(responseBody).toMatchObject({
      status: 'ok',
      version: '0.1.0',
    });
    expect(response.headers.get('x-correlation-id')).toBe('test-correlation-id');
    expect(typeof responseBody.checkedAt).toBe('string');
  });
});

async function createAccessToken(secret: string): Promise<string> {
  return new SignJWT({
    organisationId: '8b0ddf60-c5d2-469b-8a50-51df16c2c2b2',
    sessionId: 'dfe798df-c689-4bec-ac52-3b7596628c05',
    permissions: ['platform.health.read'],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('ee66fa6a-7ccd-4b4c-af56-bb71f58ebd4e')
    .setIssuer('certisphere-api')
    .setAudience('certisphere')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(secret));
}

async function readHealthResponse(response: Response): Promise<HealthResponseDto> {
  const responseBody: unknown = await response.json();

  if (!isHealthResponse(responseBody)) {
    throw new Error('Health endpoint returned an invalid response contract.');
  }

  return responseBody;
}

function isHealthResponse(value: unknown): value is HealthResponseDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.status === 'ok' &&
    typeof candidate.checkedAt === 'string' &&
    typeof candidate.version === 'string'
  );
}
