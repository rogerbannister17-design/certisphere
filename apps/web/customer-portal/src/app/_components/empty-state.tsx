import React from 'react';

interface EmptyStateProperties {
  readonly title: string;
  readonly description: string;
}

export function EmptyState({ title, description }: EmptyStateProperties): React.ReactElement {
  return (
    <section
      aria-live="polite"
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--panel)',
        padding: 24,
        maxWidth: 720,
      }}
    >
      <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>{title}</h2>
      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>{description}</p>
    </section>
  );
}
