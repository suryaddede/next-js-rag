import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  webpack: (config) => {
    // Fixes the issue with 'console' module not found in ChromaDB
    config.resolve.fallback = {
      ...config.resolve.fallback,
      console: require.resolve('console-browserify'),
    };

    return config;
  },
};

export default nextConfig;
