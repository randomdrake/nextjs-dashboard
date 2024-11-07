import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
    serverActions: {
      bodySizeLimit: '4.9mb',
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lyfjjvbubqa1v1is.public.blob.vercel-storage.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
