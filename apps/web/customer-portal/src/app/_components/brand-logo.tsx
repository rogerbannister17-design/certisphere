import React from 'react';
import { BRAND } from '@certisphere/design-system/branding';

interface BrandLogoProperties {
  readonly height: number;
}

export function BrandLogo({ height }: BrandLogoProperties): React.ReactElement {
  return (
    <picture>
      <source srcSet={BRAND.assets.logoDark} media="(prefers-color-scheme: dark)" />
      <source srcSet={BRAND.assets.logoLight} media="(prefers-color-scheme: light)" />
      <img
        src={BRAND.assets.logo}
        alt={BRAND.legalName}
        height={height}
        style={{
          display: 'block',
          width: 'auto',
          maxWidth: 'min(280px, 70vw)',
        }}
      />
    </picture>
  );
}
