/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allows node:sqlite and native C++ binary resolution
    serverComponentsExternalPackages: ['node:sqlite']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('node:sqlite');
    }
    return config;
  }
};

module.exports = nextConfig;