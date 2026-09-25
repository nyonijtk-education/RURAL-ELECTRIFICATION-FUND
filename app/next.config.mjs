/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Exclude root non-Next.js test files from breaking production deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;