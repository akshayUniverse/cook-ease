import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      console.log('Fetching recipe with ID:', id);
      
      const recipe = await prisma.recipe.findUnique({
        where: { id: id as string },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              likes: true,
              savedBy: true,
              comments: true,
            },
          },
        },
      });

      console.log('Found recipe:', recipe ? 'Yes' : 'No');

      if (!recipe) {
        console.log('Recipe not found for ID:', id);
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Parse JSON fields
      const ingredients = JSON.parse(recipe.ingredients as string);
      const instructions = JSON.parse(recipe.instructions as string);
      const tags = JSON.parse(recipe.tags as string);

      // Transform the data to match frontend interface
      const transformedRecipe = {
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
        fiber: recipe.fiber,
        sugar: recipe.sugar,
        sodium: recipe.sodium,
        ingredients: ingredients.map((ing: any) => ({
          name: ing.name || ing,
          amount: ing.amount || '1 unit',
          inPantry: ing.inPantry || Math.random() > 0.6, // Random for demo
        })),
        instructions: instructions,
        tags: tags,
        rating: recipe.rating,
        author: {
          name: recipe.author.name,
          id: recipe.author.id,
        },
        _count: recipe._count,
      };

      console.log('Returning transformed recipe:', transformedRecipe.title);
      res.status(200).json(transformedRecipe);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 