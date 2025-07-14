import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create case-insensitive search conditions for SQLite
function createSearchConditions(field: string, searchTerm: string) {
  const lower = searchTerm.toLowerCase();
  const upper = searchTerm.toUpperCase();
  const title = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
  
  return {
    OR: [
      { [field]: { contains: searchTerm } },
      { [field]: { contains: lower } },
      { [field]: { contains: upper } },
      { [field]: { contains: title } }
    ]
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      search,
      cuisine,
      mealType,
      difficulty,
      maxCookTime,
      minRating,
      maxCalories,
      ingredients,
      tags,
      limit = '24',
      offset = '0'
    } = req.query;

    // Build comprehensive search conditions
    const where: any = {};
    const conditions: any[] = [];

    // Text search in title, description, and cuisine
    if (search) {
      const searchTerm = search as string;
      conditions.push({
        OR: [
          createSearchConditions('title', searchTerm),
          createSearchConditions('description', searchTerm),
          createSearchConditions('cuisine', searchTerm)
        ].flatMap(condition => condition.OR)
      });
    }

    // Ingredient-based search
    if (ingredients) {
      const ingredientTerms = (ingredients as string).split(',').map(term => term.trim());
      const ingredientConditions = ingredientTerms.flatMap(term => 
        createSearchConditions('ingredients', term).OR
      );
      conditions.push({
        OR: ingredientConditions
      });
    }

    // Cuisine filter
    if (cuisine && cuisine !== '') {
      conditions.push({
        cuisine: { equals: cuisine as string }
      });
    }

    // Meal type filter
    if (mealType && mealType !== '') {
      conditions.push({
        mealType: { equals: mealType as string }
      });
    }

    // Difficulty filter
    if (difficulty && difficulty !== '') {
      conditions.push({
        difficulty: { equals: difficulty as string }
      });
    }

    // Cook time filter
    if (maxCookTime && parseInt(maxCookTime as string) < 120) {
      conditions.push({
        cookTime: { lte: parseInt(maxCookTime as string) }
      });
    }

    // Rating filter
    if (minRating && parseFloat(minRating as string) > 0) {
      conditions.push({
        rating: { gte: parseFloat(minRating as string) }
      });
    }

    // Calories filter
    if (maxCalories && parseInt(maxCalories as string) < 2000) {
      conditions.push({
        calories: { lte: parseInt(maxCalories as string) }
      });
    }

    // Tags filter
    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      const tagConditions = tagArray.flatMap(tag => 
        createSearchConditions('tags', tag).OR
      );
      conditions.push({
        OR: tagConditions
      });
    }

    // Combine all conditions
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Get total count for pagination
    const totalCount = await prisma.recipe.count({ where });

    // Execute search with pagination
    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            id: true
          }
        },
        _count: {
          select: {
            likes: true,
            savedBy: true,
            comments: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Transform recipes to include parsed JSON fields
    const transformedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions),
      tags: JSON.parse(recipe.tags),
      likesCount: recipe._count.likes,
      savedCount: recipe._count.savedBy,
      commentsCount: recipe._count.comments
    }));

    res.status(200).json({
      recipes: transformedRecipes,
      totalCount,
      page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(limit as string))
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 