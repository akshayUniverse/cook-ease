import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../utils/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Test different HTTP methods
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'CORS test successful',
      method: req.method,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
    });
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      message: 'POST request successful',
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      message: 'OPTIONS request handled',
      method: req.method
    });
  }

  return res.status(405).json({
    message: `Method ${req.method} not allowed`,
    allowedMethods: ['GET', 'POST', 'OPTIONS']
  });
}

export default corsMiddleware(handler); 