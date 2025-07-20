/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  images: {
    domains: ['images.unsplash.com', 'api.pexels.com', 'www.themealdb.com', 'spoonacular.com'],
  },
  
  // STABLE: Prevent Fast Refresh loops without breaking webpack
  experimental: {
    esmExternals: false,
  },
  
  // FIXED: Proper webpack config with correct glob patterns
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Stable file watching configuration with proper glob patterns
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/prisma/**',
          '**/public/**',
          '**/*.log',
          '**/*.db',
          '**/*.db-journal'
        ],
        aggregateTimeout: 2000, // Wait 2 seconds before rebuilding
        poll: false, // Use native file system events
      };
    }
    
    return config;
  },
  
  // Disable unnecessary features
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig 