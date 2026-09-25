/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if the project has type errors in non-web scripts
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disables ESLint checks during Vercel builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;