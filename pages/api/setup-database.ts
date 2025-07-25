import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🔧 Starting database setup...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'pipe' });
    console.log('✅ Prisma client generated');

    // Run migrations
    console.log('🔧 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'pipe' });
    console.log('✅ Database migrations completed');

    // Seed database
    console.log('🔧 Seeding database...');
    execSync('npm run seed', { stdio: 'pipe' });
    console.log('✅ Database seeded successfully');

    res.status(200).json({
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    res.status(500).json({ 
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
} 