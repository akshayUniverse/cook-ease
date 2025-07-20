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

  if (req.method === 'GET') {
    // Get all comments for a recipe
    try {
      const comments = await prisma.comment.findMany({
        where: { recipeId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  } else if (req.method === 'POST') {
    // Add a comment
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production') as { userId: string };
      const userId = decoded.userId;

      const { content, rating } = req.body;
      console.log('Comments API - User ID:', userId, 'Recipe ID:', recipeId, 'Content:', content, 'Rating:', rating);

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content is required' });
      }

      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          rating: rating || null,
          userId,
          recipeId,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      // If a rating was provided, update the recipe's average rating
      if (rating) {
        const comments = await prisma.comment.findMany({
          where: { 
            recipeId, 
            rating: { not: null } 
          },
          select: { rating: true },
        });

        const averageRating = comments.reduce((sum: number, comment: { rating: number | null }) => sum + (comment.rating || 0), 0) / comments.length;

        await prisma.recipe.update({
          where: { id: recipeId },
          data: { rating: averageRating },
        });
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 