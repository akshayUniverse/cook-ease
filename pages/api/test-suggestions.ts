import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const verifyToken = (token: string) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development';
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic database connection
    const recipeCount = await prisma.recipe.count();
    console.log(`📊 Total recipes in database: ${recipeCount}`);

    // Test user authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(200).json({
        status: 'error',
        message: 'No token provided',
        recipeCount,
        hasToken: false
      });
    }

    const decoded = verifyToken(token) as { userId: string } | null;
    if (!decoded) {
      return res.status(200).json({
        status: 'error',
        message: 'Invalid token',
        recipeCount,
        hasToken: true,
        validToken: false
      });
    }

    // Test user preferences
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        dietaryRestrictions: true,
        allergies: true,
        cuisinePreferences: true,
        skillLevel: true
      }
    });

    if (!user) {
      return res.status(200).json({
        status: 'error',
        message: 'User not found',
        recipeCount,
        hasToken: true,
        validToken: true,
        userFound: false
      });
    }

    let userPreferences = null;
    try {
      userPreferences = {
        dietaryRestrictions: JSON.parse(user.dietaryRestrictions || '[]'),
        allergies: JSON.parse(user.allergies || '[]'),
        cuisinePreferences: JSON.parse(user.cuisinePreferences || '[]'),
        skillLevel: user.skillLevel || 'beginner'
      };
    } catch (e) {
      console.warn('Invalid user preferences JSON:', e);
    }

    // Test getting some sample recipes
    const sampleRecipes = await prisma.recipe.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        cuisine: true,
        difficulty: true,
        cookTime: true
      }
    });

    return res.status(200).json({
      status: 'success',
      recipeCount,
      hasToken: true,
      validToken: true,
      userFound: true,
      user: {
        id: user.id,
        email: user.email
      },
      userPreferences,
      hasPreferences: !!(userPreferences && (
        userPreferences.dietaryRestrictions.length > 0 ||
        userPreferences.allergies.length > 0 ||
        userPreferences.cuisinePreferences.length > 0 ||
        userPreferences.skillLevel !== 'beginner'
      )),
      sampleRecipes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(200).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 