/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disables ESLint checking during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;