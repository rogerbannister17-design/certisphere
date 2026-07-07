import { describe, expect, it } from 'vitest';

import { getDatabaseHealth } from './index.js';

describe('database package', () => {
  it('reports the configured database package boundary', () => {
    expect(getDatabaseHealth()).toEqual({
      status: 'configured',
    });
  });
});
