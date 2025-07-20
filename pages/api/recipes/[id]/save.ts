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
  console.log('Save API - Token received:', token ? 'Yes' : 'No');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production') as { userId: string };
    const userId = decoded.userId;
    console.log('Save API - User ID:', userId, 'Recipe ID:', recipeId);

    if (req.method === 'POST') {
      // Save the recipe
      const existingSave = await prisma.savedRecipe.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      if (existingSave) {
        return res.status(400).json({ error: 'Recipe already saved' });
      }

      await prisma.savedRecipe.create({
        data: {
          userId,
          recipeId,
        },
      });

      console.log('Save API - Recipe saved successfully');
      res.status(200).json({ message: 'Recipe saved successfully' });
    } else if (req.method === 'DELETE') {
      // Unsave the recipe
      const existingSave = await prisma.savedRecipe.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      if (!existingSave) {
        return res.status(400).json({ error: 'Recipe not saved' });
      }

      await prisma.savedRecipe.delete({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      res.status(200).json({ message: 'Recipe unsaved successfully' });
    } else if (req.method === 'GET') {
      // Check if user has saved the recipe
      const existingSave = await prisma.savedRecipe.findUnique({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      });

      res.status(200).json({ isSaved: !!existingSave });
    } else {
      res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error handling save:', error);
    res.status(500).json({ error: 'Failed to handle save action' });
  }
} 