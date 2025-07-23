import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production') as { userId: string };
    const userId = decoded.userId;

    if (req.method === 'GET') {
      // Get user's shopping list
      const shoppingList = await prisma.shoppingList.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(shoppingList);
    } else if (req.method === 'POST') {
      // Add items to shopping list
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      // Add each item to the shopping list
      const createdItems = await Promise.all(
        items.map((item: { name: string; amount: string; recipeId?: string }) =>
          prisma.shoppingList.create({
            data: {
              userId,
              item: item.name,
              amount: item.amount,
              recipeId: item.recipeId || null,
            },
          })
        )
      );

      res.status(201).json(createdItems);
    } else if (req.method === 'DELETE') {
      // Clear shopping list
      await prisma.shoppingList.deleteMany({
        where: { userId },
      });

      res.status(200).json({ message: 'Shopping list cleared' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error handling shopping list:', error);
    res.status(500).json({ error: 'Failed to handle shopping list' });
  }
} 