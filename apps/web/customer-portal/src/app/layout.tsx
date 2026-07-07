import type { Metadata } from 'next';
import type React from 'react';
import { BRAND } from '@certisphere/design-system/branding';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: BRAND.applications.customerPortal,
    template: `%s | ${BRAND.applications.customerPortal}`,
  },
  description: BRAND.tagline,
  applicationName: BRAND.applications.customerPortal,
  metadataBase: new URL(BRAND.website),
  icons: {
    icon: [
      { url: BRAND.assets.favicon, sizes: 'any' },
      { url: BRAND.assets.faviconSvg, type: 'image/svg+xml' },
    ],
    apple: BRAND.assets.appleTouchIcon,
  },
  manifest: BRAND.assets.manifest,
  openGraph: {
    title: BRAND.applications.customerPortal,
    description: BRAND.tagline,
    url: BRAND.website,
    siteName: BRAND.applications.customerPortal,
    images: [
      {
        url: BRAND.assets.logo,
        alt: BRAND.applications.customerPortal,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.applications.customerPortal,
    description: BRAND.tagline,
    images: [BRAND.assets.logo],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
