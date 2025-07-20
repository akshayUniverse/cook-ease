import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Testing database connection...');
    
    // Test database connection
    const userCount = await prisma.user.count();
    const recipeCount = await prisma.recipe.count();
    
    console.log('Database test successful:', { userCount, recipeCount });
    
    res.status(200).json({
      message: 'Database connection successful',
      userCount,
      recipeCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 