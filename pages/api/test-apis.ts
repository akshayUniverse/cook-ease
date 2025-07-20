import type { NextApiRequest, NextApiResponse } from 'next';
import { TheMealDBAPI, SpoonacularAPI, ImageAPI } from '../../utils/apiIntegration';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = {
    timestamp: new Date().toISOString(),
    apis: {
      themealdb: { status: 'unknown', message: '', data: null as any },
      spoonacular: { status: 'unknown', message: '', data: null as any },
      unsplash: { status: 'unknown', message: '', data: null as any },
      pexels: { status: 'unknown', message: '', data: null as any }
    },
    summary: {
      working: 0,
      total: 4,
      essential: 0, // TheMealDB is essential
      optional: 0   // Others are optional
    }
  };

  // Test TheMealDB (Essential - No API key needed)
  console.log('🧪 Testing TheMealDB...');
  try {
    const mealDB = new TheMealDBAPI();
    const testRecipe = await mealDB.getRandomRecipes(1);
    
    if (testRecipe && testRecipe.length > 0) {
      results.apis.themealdb.status = 'working';
      results.apis.themealdb.message = 'Successfully fetched random recipe';
      results.apis.themealdb.data = {
        recipeName: testRecipe[0].title,
        cuisine: testRecipe[0].cuisine,
        ingredients: testRecipe[0].ingredients.length
      };
      results.summary.working++;
      results.summary.essential++;
    } else {
      results.apis.themealdb.status = 'error';
      results.apis.themealdb.message = 'No recipes returned';
    }
  } catch (error) {
    results.apis.themealdb.status = 'error';
    results.apis.themealdb.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test Spoonacular (Optional - Needs API key)
  console.log('🧪 Testing Spoonacular...');
  try {
    const spoonacular = new SpoonacularAPI();
    
    if (!process.env.SPOONACULAR_API_KEY) {
      results.apis.spoonacular.status = 'not_configured';
      results.apis.spoonacular.message = 'API key not configured';
    } else {
      const testRecipes = await spoonacular.searchRecipes('chicken', 'indian');
      
      if (testRecipes && testRecipes.length > 0) {
        results.apis.spoonacular.status = 'working';
        results.apis.spoonacular.message = 'Successfully fetched recipes';
        results.apis.spoonacular.data = {
          recipesFound: testRecipes.length,
          firstRecipe: testRecipes[0].title,
          hasNutrition: testRecipes[0].calories > 0
        };
        results.summary.working++;
        results.summary.optional++;
      } else {
        results.apis.spoonacular.status = 'error';
        results.apis.spoonacular.message = 'No recipes returned';
      }
    }
  } catch (error) {
    results.apis.spoonacular.status = 'error';
    results.apis.spoonacular.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test Unsplash (Optional - Needs API key)
  console.log('🧪 Testing Unsplash...');
  try {
    const imageAPI = new ImageAPI();
    
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      results.apis.unsplash.status = 'not_configured';
      results.apis.unsplash.message = 'API key not configured';
    } else {
      const testImage = await imageAPI.getUnsplashImage('indian curry');
      
      if (testImage) {
        results.apis.unsplash.status = 'working';
        results.apis.unsplash.message = 'Successfully fetched image';
        results.apis.unsplash.data = {
          imageUrl: testImage,
          isValidUrl: testImage.includes('https://images.unsplash.com')
        };
        results.summary.working++;
        results.summary.optional++;
      } else {
        results.apis.unsplash.status = 'error';
        results.apis.unsplash.message = 'No image returned';
      }
    }
  } catch (error) {
    results.apis.unsplash.status = 'error';
    results.apis.unsplash.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test Pexels (Optional - Needs API key)
  console.log('🧪 Testing Pexels...');
  try {
    const imageAPI = new ImageAPI();
    
    if (!process.env.PEXELS_API_KEY) {
      results.apis.pexels.status = 'not_configured';
      results.apis.pexels.message = 'API key not configured';
    } else {
      const testImage = await imageAPI.getPexelsImage('indian curry');
      
      if (testImage) {
        results.apis.pexels.status = 'working';
        results.apis.pexels.message = 'Successfully fetched image';
        results.apis.pexels.data = {
          imageUrl: testImage,
          isValidUrl: testImage.includes('https://images.pexels.com')
        };
        results.summary.working++;
        results.summary.optional++;
      } else {
        results.apis.pexels.status = 'error';
        results.apis.pexels.message = 'No image returned';
      }
    }
  } catch (error) {
    results.apis.pexels.status = 'error';
    results.apis.pexels.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Calculate totals
  results.summary.total = 4;

  // Determine overall status
  const overallStatus = results.summary.essential > 0 ? 'ready' : 'needs_setup';
  const recommendations = [];

  if (results.apis.themealdb.status !== 'working') {
    recommendations.push('⚠️ TheMealDB is not working - this is essential for the app');
  }
  
  if (results.apis.spoonacular.status === 'not_configured') {
    recommendations.push('💡 Add Spoonacular API key for better nutrition data');
  }
  
  if (results.apis.unsplash.status === 'not_configured') {
    recommendations.push('💡 Add Unsplash API key for high-quality images');
  }
  
  if (results.apis.pexels.status === 'not_configured') {
    recommendations.push('💡 Add Pexels API key as image backup');
  }

  console.log(`🎯 API Test Results: ${results.summary.working}/${results.summary.total} working`);

  res.status(200).json({
    status: overallStatus,
    message: `${results.summary.working}/${results.summary.total} APIs working`,
    recommendations,
    results
  });
} 