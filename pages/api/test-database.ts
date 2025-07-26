import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../../utils/cors';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test if users table exists
    const userCount = await prisma.user.count();
    
    res.status(200).json({
      message: 'Database connection successful',
      databaseTest: result,
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
      environment: process.env.NODE_ENV
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default corsMiddleware(handler); 