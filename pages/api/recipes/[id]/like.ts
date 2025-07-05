import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const recipeId = id as string;

  // Verify authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('Like API - Token received:', token ? 'Yes' : 'No');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as { userId: string };
    const userId = decoded.userId;
    console.log('Like API - User ID:', userId, 'Recipe ID:', recipeId);

    if (req.method === 'POST') {
      // Like the recipe
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      if (existingLike) {
        return res.status(400).json({ error: 'Recipe already liked' });
      }

      await prisma.like.create({
        data: {
          userId,
          recipeId,
        },
      });

      console.log('Like API - Recipe liked successfully');
      res.status(200).json({ message: 'Recipe liked successfully' });
    } else if (req.method === 'DELETE') {
      // Unlike the recipe
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      if (!existingLike) {
        return res.status(400).json({ error: 'Recipe not liked' });
      }

      await prisma.like.delete({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      res.status(200).json({ message: 'Recipe unliked successfully' });
    } else if (req.method === 'GET') {
      // Check if user has liked the recipe
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      res.status(200).json({ isLiked: !!existingLike });
    } else {
      res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error handling like:', error);
    res.status(500).json({ error: 'Failed to handle like action' });
  }
} 