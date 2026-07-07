import { describe, expect, it } from 'vitest';

import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('returns the API gateway health contract', () => {
    const service = new HealthService();

    const health = service.getHealth();

    expect(health.status).toBe('ok');
    expect(health.version).toBe('0.1.0');
    expect(new Date(health.checkedAt).toISOString()).toBe(health.checkedAt);
  });
});
