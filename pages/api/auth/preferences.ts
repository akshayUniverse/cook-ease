import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret');
  } catch (error) {
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token) as { userId: string };
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { dietaryRestrictions, allergies, cuisinePreferences, skillLevel } = req.body;

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        dietaryRestrictions: dietaryRestrictions || "[]",
        allergies: allergies || "[]", 
        cuisinePreferences: cuisinePreferences || "[]",
        skillLevel: skillLevel || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        dietaryRestrictions: true,
        allergies: true,
        cuisinePreferences: true,
        skillLevel: true,
      }
    });

    res.status(200).json({
      message: 'Preferences updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 