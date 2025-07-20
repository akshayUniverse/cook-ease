import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dietaryRestrictions: "[]",
        allergies: "[]",
        cuisinePreferences: "[]",
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 