import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // Verify authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production') as { userId: string };
    const userId = decoded.userId;

    if (req.method === 'PUT') {
      // Update shopping list item
      const { completed } = req.body;

      const updatedItem = await prisma.shoppingList.update({
        where: {
          id: id as string,
          userId: userId // Ensure user can only update their own items
        },
        data: {
          completed: completed
        }
      });

      res.status(200).json(updatedItem);
    } else if (req.method === 'DELETE') {
      // Delete shopping list item
      await prisma.shoppingList.delete({
        where: {
          id: id as string,
          userId: userId // Ensure user can only delete their own items
        }
      });

      res.status(200).json({ message: 'Item deleted successfully' });
    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error handling shopping list item:', error);
    res.status(500).json({ error: 'Failed to handle request' });
  }
} 