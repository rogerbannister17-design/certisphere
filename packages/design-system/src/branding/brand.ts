export const BRAND = {
  name: 'Certisphere',
  legalName: 'Certisphere™',
  tagline: 'Build, manage and certify your management systems in one platform.',
  website: 'https://certisphere.io',
  company: 'Certisphere',
  supportEmail: 'support@certisphere.io',
  primaryColour: '#0F3D75',
  secondaryColour: '#2E8BFF',
  accentColour: '#00C2FF',
  copyright: '© 2026 Certisphere™. All rights reserved.',
  assets: {
    logo: '/branding/logo.svg',
    logoLight: '/branding/logo-light.svg',
    logoDark: '/branding/logo-dark.svg',
    favicon: '/favicon.ico',
    faviconSvg: '/favicon.svg',
    appleTouchIcon: '/apple-touch-icon.png',
    manifest: '/site.webmanifest',
  },
  applications: {
    customerPortal: 'Certisphere™',
    platformAdmin: 'Certisphere Administration',
    auditorPortal: 'Certisphere Auditor Portal',
    consultantPortal: 'Certisphere Consultant Portal',
    api: 'Certisphere API',
  },
} as const;

export type Brand = typeof BRAND;
