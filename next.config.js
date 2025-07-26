/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Add CORS headers for API routes
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // In production, you might want to restrict this
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
  
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