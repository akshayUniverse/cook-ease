import { NextApiRequest, NextApiResponse } from 'next';
import { specs } from '../../utils/swagger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.status(200).json(specs);
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    res.status(500).json({ message: 'Error generating API documentation' });
  }
} 