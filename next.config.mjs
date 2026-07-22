/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    VOUCHERS_ACTIVE: process.env.VOUCHERS_ACTIVE,
    DIRA_CIRCLE_ACTIVE: process.env.DIRA_CIRCLE_ACTIVE,
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org https://*.telegram.org;
      style-src 'self' 'unsafe-inline' https://unpkg.com;
      img-src 'self' blob: data: https://*.openstreetmap.org https://unpkg.com;
      connect-src 'self' http://localhost:3001 http://localhost:4000 https://*.diraafrica.org https://*.pretium.money ws://localhost:* wss://* http://127.0.0.1:* http://localhost:*;
      frame-ancestors 'self' https://telegram.org https://*.telegram.org;
      frame-src 'self' https://telegram.org https://*.telegram.org;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), accelerometer=(), gyroscope=(), magnetometer=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

