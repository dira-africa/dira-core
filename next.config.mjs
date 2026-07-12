/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    VOUCHERS_ACTIVE: process.env.VOUCHERS_ACTIVE,
    DIRA_CIRCLE_ACTIVE: process.env.DIRA_CIRCLE_ACTIVE,
  }
};

export default nextConfig;
