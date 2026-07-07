'use client';

import React from 'react';

interface ErrorPageProperties {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProperties): React.ReactElement {
  return (
    <main
      role="alert"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <section
        style={{
          width: 'min(640px, 100%)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--panel)',
          padding: 24,
        }}
      >
        <h1 style={{ marginTop: 0 }}>Unable to load workspace</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          {error.digest ?? 'The request could not be completed.'}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight: 44,
            border: '1px solid var(--accent)',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#ffffff',
            padding: '0 16px',
            fontWeight: 700,
          }}
        >
          Retry
        </button>
      </section>
    </main>
  );
}
