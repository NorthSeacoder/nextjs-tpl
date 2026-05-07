import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@nextjs-tpl/ui', '@nextjs-tpl/db', '@nextjs-tpl/api-contract'],
  turbopack: {
    root: '../..',
  },
};

export default nextConfig;
