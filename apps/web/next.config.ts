import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: [
    '@sur-o-jhankaar/shared-types',
    '@sur-o-jhankaar/theme-engine',
    '@sur-o-jhankaar/player-core'
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@sur-o-jhankaar/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@sur-o-jhankaar/theme-engine': path.resolve(__dirname, '../../packages/theme-engine/src/index.ts'),
      '@sur-o-jhankaar/player-core': path.resolve(__dirname, '../../packages/player-core/src/index.ts')
    };
    return config;
  }
};

export default nextConfig;
