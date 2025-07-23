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
      const savedRecipes = await prisma.savedRecipe.findMany({
        where: { userId },
        include: {
          recipe: {
            include: {
              author: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          savedAt: 'desc',
        },
      });

      // Transform the data to match frontend interface
      const transformedRecipes = savedRecipes.map((saved: any) => {
        const recipe = saved.recipe;
        const ingredients = JSON.parse(recipe.ingredients as string);
        const instructions = JSON.parse(recipe.instructions as string);
        const tags = JSON.parse(recipe.tags as string);

        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          image: recipe.image,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisine: recipe.cuisine,
          mealType: recipe.mealType,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          ingredients: ingredients,
          instructions: instructions,
          tags: tags,
          rating: recipe.rating,
          author: {
            name: recipe.author.name,
          },
          savedAt: saved.createdAt,
        };
      });

      res.status(200).json(transformedRecipes);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    res.status(500).json({ error: 'Failed to fetch saved recipes' });
  }
} 