/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: 'tsconfig.build.json',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;