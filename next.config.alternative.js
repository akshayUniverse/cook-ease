/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Completely disable fast refresh for stable development
  experimental: {
    esmExternals: false,
  },
  // Disable hot reloading
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: /node_modules/,
        poll: 5000, // Check for changes every 5 seconds instead of instantly
        aggregateTimeout: 2000, // Wait 2 seconds before reloading
      }
    }
    return config
  },
}

module.exports = nextConfig 