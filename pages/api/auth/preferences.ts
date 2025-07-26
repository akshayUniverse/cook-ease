import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * @swagger
 * /auth/preferences:
 *   post:
 *     summary: Update user preferences
 *     description: Update user dietary restrictions, allergies, and cuisine preferences
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dietaryRestrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["vegetarian", "gluten-free"]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nuts", "shellfish"]
 *               cuisinePreferences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["italian", "mexican"]
 *               skillLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "intermediate"
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Preferences updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const userId = decoded.userId;

    const { dietaryRestrictions, allergies, cuisinePreferences, skillLevel } = req.body;

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dietaryRestrictions: JSON.stringify(dietaryRestrictions || []),
        allergies: JSON.stringify(allergies || []),
        cuisinePreferences: JSON.stringify(cuisinePreferences || []),
        skillLevel: skillLevel || 'beginner'
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
    console.error('Preferences update error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
} 