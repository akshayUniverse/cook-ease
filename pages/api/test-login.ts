import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../utils/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Mock successful login (no database)
    res.status(200).json({
      message: 'Test login successful',
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: email,
        dietaryRestrictions: '[]',
        allergies: '[]',
        cuisinePreferences: '[]',
        skillLevel: 'beginner'
      },
      token: 'test-jwt-token',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Not configured'
    });

  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default corsMiddleware(handler); 