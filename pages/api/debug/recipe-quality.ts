import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only allow in development or with debug parameter
  if (process.env.NODE_ENV === 'production' && !req.query.debug) {
    return res.status(403).json({ error: 'Debug endpoint not available' });
  }

  try {
    console.log('🔍 Checking recipe data quality...');
    
    // Get all recipes
    const allRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        ingredients: true,
        instructions: true,
        image: true,
        cookTime: true,
        difficulty: true,
        cuisine: true,
        mealType: true,
        rating: true,
        calories: true
      }
    });

    const qualityReport = {
      totalRecipes: allRecipes.length,
      healthyRecipes: 0,
      issues: [] as any[],
      breakdown: {
        missingTitle: 0,
        missingDescription: 0,
        missingIngredients: 0,
        missingInstructions: 0,
        missingImage: 0,
        invalidIngredients: 0,
        invalidInstructions: 0,
        missingDifficulty: 0,
        missingCuisine: 0,
        missingMealType: 0,
        externalIds: 0
      },
      healthyByDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      },
      samplesWithIssues: [] as any[]
    };

    allRecipes.forEach(recipe => {
      const issues = [];
      
      // Check basic fields
      if (!recipe.title || recipe.title.trim().length === 0) {
        issues.push('Missing title');
        qualityReport.breakdown.missingTitle++;
      }
      
      if (!recipe.description || recipe.description.trim().length === 0) {
        issues.push('Missing description');
        qualityReport.breakdown.missingDescription++;
      }
      
      if (!recipe.difficulty) {
        issues.push('Missing difficulty');
        qualityReport.breakdown.missingDifficulty++;
      }
      
      if (!recipe.cuisine) {
        issues.push('Missing cuisine');
        qualityReport.breakdown.missingCuisine++;
      }
      
      if (!recipe.mealType) {
        issues.push('Missing meal type');
        qualityReport.breakdown.missingMealType++;
      }
      
      if (!recipe.image || recipe.image === '/images/dishes/default-recipe.jpg') {
        issues.push('Missing or default image');
        qualityReport.breakdown.missingImage++;
      }
      
      // Check if it's an external recipe ID
      if (recipe.id.startsWith('themealdb_') || recipe.id.startsWith('spoonacular_')) {
        issues.push('External recipe ID (should be in local DB only)');
        qualityReport.breakdown.externalIds++;
      }
      
      // Check ingredients
      if (!recipe.ingredients) {
        issues.push('Missing ingredients');
        qualityReport.breakdown.missingIngredients++;
      } else {
        try {
          const ingredients = JSON.parse(recipe.ingredients);
          if (!Array.isArray(ingredients) || ingredients.length === 0) {
            issues.push('Invalid or empty ingredients array');
            qualityReport.breakdown.invalidIngredients++;
          }
        } catch (error) {
          issues.push('Invalid ingredients JSON');
          qualityReport.breakdown.invalidIngredients++;
        }
      }
      
      // Check instructions
      if (!recipe.instructions) {
        issues.push('Missing instructions');
        qualityReport.breakdown.missingInstructions++;
      } else {
        try {
          const instructions = JSON.parse(recipe.instructions);
          if (!Array.isArray(instructions) || instructions.length === 0) {
            issues.push('Invalid or empty instructions array');
            qualityReport.breakdown.invalidInstructions++;
          }
        } catch (error) {
          issues.push('Invalid instructions JSON');
          qualityReport.breakdown.invalidInstructions++;
        }
      }
      
      // If no issues, it's healthy
      if (issues.length === 0) {
        qualityReport.healthyRecipes++;
        if (recipe.difficulty) {
          qualityReport.healthyByDifficulty[recipe.difficulty as keyof typeof qualityReport.healthyByDifficulty]++;
        }
      } else {
        // Add to issues list for samples
        if (qualityReport.samplesWithIssues.length < 10) {
          qualityReport.samplesWithIssues.push({
            id: recipe.id,
            title: recipe.title,
            issues
          });
        }
      }
    });

    console.log('✅ Recipe quality check complete');
    
    return res.status(200).json({
      status: 'success',
      report: qualityReport,
      recommendations: [
        qualityReport.breakdown.externalIds > 0 ? 'Remove external recipe IDs from database' : null,
        qualityReport.breakdown.invalidIngredients > 0 ? 'Fix invalid ingredients JSON' : null,
        qualityReport.breakdown.invalidInstructions > 0 ? 'Fix invalid instructions JSON' : null,
        qualityReport.breakdown.missingImage > 0 ? 'Add proper images for recipes' : null,
        qualityReport.healthyRecipes < 10 ? 'Need more complete recipes for good suggestions' : null
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('❌ Error checking recipe quality:', error);
    return res.status(500).json({ error: 'Failed to check recipe quality' });
  } finally {
    await prisma.$disconnect();
  }
} 