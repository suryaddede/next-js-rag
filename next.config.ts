import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  // Allow embedding in iframes
  async headers() {
    return [
      {
        source: '/embed',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
      {
        source: '/chat-widget.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
        ],
      },
    ];
  },

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
