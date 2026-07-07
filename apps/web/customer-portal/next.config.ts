import type { NextConfig } from 'next';
import { join } from 'node:path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: join(process.cwd(), '../../..'),
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
