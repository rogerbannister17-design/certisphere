import React from 'react';
import { BRAND } from '@certisphere/design-system/branding';

import { BrandLogo } from './_components/brand-logo';
import { EmptyState } from './_components/empty-state';
import { resolveWorkspaceAccess } from './_security/workspace-access';

const workspaceSections = [
  'Documents',
  'Audits',
  'Evidence',
  'Risks',
  'CAPA',
  'Training',
] as const;

export default function Page(): React.ReactElement {
  const workspaceAccess = resolveWorkspaceAccess();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel)',
          padding: '18px 32px',
        }}
      >
        <BrandLogo height={42} />
      </header>

      <section
        aria-labelledby="workspace-title"
        style={{
          width: 'min(1180px, calc(100% - 48px))',
          margin: '0 auto',
          padding: '48px 0',
        }}
      >
        <p
          style={{
            margin: '0 0 8px',
            color: 'var(--accent)',
            fontWeight: 700,
          }}
        >
          Management System Workspace
        </p>
        <h1 id="workspace-title" style={{ margin: 0, fontSize: 42, letterSpacing: 0 }}>
          {BRAND.legalName}
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 680, lineHeight: 1.6 }}>
          {BRAND.tagline}
        </p>

        {workspaceAccess.granted ? (
          <div
            aria-label="Core workspace areas"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginTop: 32,
            }}
          >
            {workspaceSections.map((section) => (
              <div
                key={section}
                style={{
                  minHeight: 96,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  padding: 18,
                }}
              >
                <strong>{section}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 32 }}>
            <EmptyState title="Workspace unavailable" description={workspaceAccess.reason} />
          </div>
        )}
      </section>
    </main>
  );
}
