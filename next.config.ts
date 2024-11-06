import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lyfjjvbubqa1v1is.public.blob.vercel-storage.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
