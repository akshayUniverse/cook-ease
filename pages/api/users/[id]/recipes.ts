import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production') as { userId: string };
    const requestingUserId = decoded.userId;

    // Users can only access their own recipes or all recipes could be public
    if (requestingUserId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch user's recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        authorId: id as string
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            savedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
} 