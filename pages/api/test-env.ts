import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
      JWT_SECRET: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Configured' : 'Not configured',
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };

    // Check if DATABASE_URL is valid
    let databaseStatus = 'Not configured';
    if (process.env.DATABASE_URL) {
      if (process.env.DATABASE_URL.includes('postgresql://')) {
        databaseStatus = 'PostgreSQL configured';
      } else if (process.env.DATABASE_URL.includes('file:')) {
        databaseStatus = 'SQLite configured';
      } else {
        databaseStatus = 'Unknown database type';
      }
    }

    res.status(200).json({
      message: 'Environment variables check',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      envVars,
      databaseStatus,
      recommendations: {
        database: !process.env.DATABASE_URL ? 'Set DATABASE_URL environment variable' : 'Database URL is configured',
        jwt: !process.env.JWT_SECRET && !process.env.NEXTAUTH_SECRET ? 'Set JWT_SECRET or NEXTAUTH_SECRET' : 'JWT secret is configured',
        production: process.env.NODE_ENV === 'production' ? 'Running in production mode' : 'Not in production mode'
      }
    });

  } catch (error) {
    console.error('Environment test error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 