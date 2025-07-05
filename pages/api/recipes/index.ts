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

// Helper function to check if recipe matches user preferences
const matchesUserPreferences = (recipe: any, userPreferences: any) => {
  if (!userPreferences) return true;

  const { dietaryRestrictions, allergies, cuisinePreferences, skillLevel } = userPreferences;

  // Check dietary restrictions
  if (dietaryRestrictions?.length > 0) {
    const recipeTags = recipe.tags;
    const hasMatch = dietaryRestrictions.some((restriction: string) => {
      switch (restriction) {
        case 'vegetarian':
          return recipeTags.includes('vegetarian') || recipeTags.includes('vegan');
        case 'vegan':
          return recipeTags.includes('vegan');
        case 'gluten-free':
          return recipeTags.includes('gluten-free');
        case 'dairy-free':
          return recipeTags.includes('dairy-free');
        case 'keto':
          return recipeTags.includes('keto') || recipeTags.includes('low-carb');
        case 'paleo':
          return recipeTags.includes('paleo');
        case 'low-carb':
          return recipeTags.includes('low-carb') || recipe.carbs < 20;
        case 'mediterranean':
          return recipe.cuisine === 'mediterranean' || recipeTags.includes('mediterranean');
        default:
          return false;
      }
    });
    // If user has dietary restrictions but recipe doesn't match any, exclude it
    if (!hasMatch && dietaryRestrictions.some((r: string) => ['vegetarian', 'vegan'].includes(r))) {
      return false;
    }
  }

  // Check allergies - exclude recipes with allergens
  if (allergies?.length > 0) {
    const recipeIngredients = recipe.ingredients;
    const hasAllergen = allergies.some((allergy: string) => {
      return recipeIngredients.some((ingredient: any) => {
        const ingredientName = ingredient.name.toLowerCase();
        switch (allergy) {
          case 'nuts':
            return ingredientName.includes('nut') || ingredientName.includes('almond') || ingredientName.includes('cashew');
          case 'dairy':
            return ingredientName.includes('milk') || ingredientName.includes('cheese') || ingredientName.includes('cream') || ingredientName.includes('butter');
          case 'eggs':
            return ingredientName.includes('egg');
          case 'shellfish':
            return ingredientName.includes('shrimp') || ingredientName.includes('crab') || ingredientName.includes('lobster');
          case 'soy':
            return ingredientName.includes('soy');
          case 'wheat':
            return ingredientName.includes('wheat') || ingredientName.includes('flour');
          case 'fish':
            return ingredientName.includes('fish') || ingredientName.includes('salmon') || ingredientName.includes('tuna');
          default:
            return false;
        }
      });
    });
    if (hasAllergen) return false;
  }

  // Check skill level
  if (skillLevel) {
    const skillOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const userSkillLevel = skillOrder[skillLevel as keyof typeof skillOrder] || 1;
    const recipeSkillLevel = skillOrder[recipe.difficulty as keyof typeof skillOrder] || 1;
    
    // Only show recipes at or below user's skill level
    if (recipeSkillLevel > userSkillLevel) return false;
  }

  return true;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { 
        mealType, 
        cuisine, 
        difficulty, 
        search, 
        limit = '20', 
        offset = '0',
        personalized = 'false'
      } = req.query;

      // Get user preferences if token provided and personalized requested
      let userPreferences: {
        dietaryRestrictions: string[];
        allergies: string[];
        cuisinePreferences: string[];
        skillLevel: string;
      } | null = null;
      if (personalized === 'true') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
          const decoded = verifyToken(token) as { userId: string } | null;
          if (decoded) {
            const user = await prisma.user.findUnique({
              where: { id: decoded.userId },
              select: {
                dietaryRestrictions: true,
                allergies: true,
                cuisinePreferences: true,
                skillLevel: true
              }
            });
            
            if (user) {
              userPreferences = {
                dietaryRestrictions: JSON.parse(user.dietaryRestrictions || '[]'),
                allergies: JSON.parse(user.allergies || '[]'),
                cuisinePreferences: JSON.parse(user.cuisinePreferences || '[]'),
                skillLevel: user.skillLevel || 'beginner'
              };
            }
          }
        }
      }

      // Build filter conditions
      const where: any = {};

      if (mealType && mealType !== 'all') {
        where.mealType = mealType as string;
      }

      if (cuisine && cuisine !== 'all') {
        where.cuisine = cuisine as string;
      }

      if (difficulty && difficulty !== 'all') {
        where.difficulty = difficulty as string;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { cuisine: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // If user has cuisine preferences and no specific cuisine is being filtered, prefer user's preferred cuisines
      if (userPreferences && userPreferences.cuisinePreferences && userPreferences.cuisinePreferences.length > 0 && !cuisine) {
        where.OR = [
          ...(where.OR || []),
          { cuisine: { in: userPreferences.cuisinePreferences } }
        ];
      }

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
        orderBy: (userPreferences && userPreferences.cuisinePreferences && userPreferences.cuisinePreferences.length > 0) ? [
          { 
            cuisine: userPreferences.cuisinePreferences.includes('italian') ? 'asc' : 'desc' 
          },
          { createdAt: 'desc' }
        ] : {
          createdAt: 'desc'
        },
        take: parseInt(limit as string) * 2, // Get more to filter down
        skip: parseInt(offset as string)
      });

      // Parse JSON fields for frontend
      let recipesWithParsedData = recipes.map((recipe: any) => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
        tags: JSON.parse(recipe.tags),
        // Add computed fields for compatibility
        rating: 4.5 + Math.random() * 0.5, // Temporary: random rating between 4.5-5
        price: Math.floor(Math.random() * 20) + 10, // Temporary: random price for demo
        badge: JSON.parse(recipe.tags).includes('vegetarian') ? '♥ Favorite' : 
               recipe.difficulty === 'hard' ? '🔧 Skill' : '🌍 Adventure'
      }));

      // Apply user preference filtering
      if (userPreferences) {
        recipesWithParsedData = recipesWithParsedData.filter((recipe: any) => 
          matchesUserPreferences(recipe, userPreferences)
        );
      }

      // Limit to requested amount after filtering
      recipesWithParsedData = recipesWithParsedData.slice(0, parseInt(limit as string));

      res.status(200).json({
        recipes: recipesWithParsedData,
        total: recipesWithParsedData.length,
        personalized: !!userPreferences
      });

    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } 
  else if (req.method === 'POST') {
    // Create new recipe (for future use)
    try {
      const {
        title,
        description,
        image,
        cookTime,
        servings,
        difficulty,
        cuisine,
        mealType,
        calories,
        protein,
        carbs,
        fat,
        ingredients,
        instructions,
        tags,
        authorId
      } = req.body;

      const recipe = await prisma.recipe.create({
        data: {
          title,
          description,
          image,
          cookTime: parseInt(cookTime),
          servings: parseInt(servings),
          difficulty,
          cuisine,
          mealType,
          calories: parseInt(calories),
          protein: parseFloat(protein),
          carbs: parseFloat(carbs),
          fat: parseFloat(fat),
          ingredients: JSON.stringify(ingredients),
          instructions: JSON.stringify(instructions),
          tags: JSON.stringify(tags),
          authorId
        },
        include: {
          author: {
            select: {
              name: true,
              id: true
            }
          }
        }
      });

      res.status(201).json(recipe);

    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } 
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 