/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Service worker must be served from root with correct scope
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Security and PWA headers for all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Required for DeviceMotion on iOS in some contexts
          { key: 'Permissions-Policy', value: 'accelerometer=*, gyroscope=*, magnetometer=*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
