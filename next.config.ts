import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Remove 'standalone' output for Vercel deployment

  // Allow embedding in iframes for all routes
  async headers() {
    return [
      {
        // Allow all pages to be embedded in iframes
        source: '/(.*)',
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
        // Specific configuration for embed route
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
        // Allow chat widget to be loaded cross-origin
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
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
      {
        // Allow API routes to be called from iframes
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
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
