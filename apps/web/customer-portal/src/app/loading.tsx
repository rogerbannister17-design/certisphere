import React from 'react';
import { BRAND } from '@certisphere/design-system/branding';

export default function Loading(): React.ReactElement {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <p style={{ color: 'var(--muted)' }}>Loading {BRAND.legalName}...</p>
    </main>
  );
}
