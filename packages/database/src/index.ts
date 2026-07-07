export interface DatabaseHealth {
  readonly status: 'configured';
}

export function getDatabaseHealth(): DatabaseHealth {
  return {
    status: 'configured',
  };
}
