import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const envCheck = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasJwtSecret: !!(process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET),
      databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
    };

    res.status(200).json({
      message: 'Environment variables check',
      env: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test env error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 