import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { searchTheMealDBByIngredient, convertExternalToLocal, getRandomTheMealDBRecipes, searchTheMealDBByCuisine } from '../../../utils/realTimeApiSearch';

const prisma = new PrismaClient();

// Helper function to verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
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

  // Check cuisine preferences - if user has preferences, prioritize them but don't exclude others
  if (cuisinePreferences?.length > 0) {
    const recipeCuisine = recipe.cuisine.toLowerCase();
    const matchesCuisine = cuisinePreferences.some((pref: string) => 
      recipeCuisine.includes(pref.toLowerCase()) || pref.toLowerCase().includes(recipeCuisine)
    );
    // Don't exclude non-matching cuisines, just note preference for ranking
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

// Helper function to check if recipe matches ingredient search
const matchesIngredientSearch = (recipe: any, ingredients: string[]) => {
  if (!ingredients || ingredients.length === 0) return true;
  
  // Handle different ingredient formats
  let recipeIngredients: string[] = [];
  
  if (Array.isArray(recipe.ingredients)) {
    recipeIngredients = recipe.ingredients.map((ing: any) => {
      if (typeof ing === 'string') {
        return ing.toLowerCase();
      } else if (ing && typeof ing === 'object' && ing.name) {
        return ing.name.toLowerCase();
      } else if (ing && typeof ing === 'object' && ing.ingredient) {
        return ing.ingredient.toLowerCase();
      } else {
        return String(ing).toLowerCase();
      }
    });
  }
  
  // Return true if ANY of the search ingredients is found in the recipe
  return ingredients.some((searchIngredient: string) => 
    recipeIngredients.some((recipeIng: string) => 
      recipeIng.includes(searchIngredient.toLowerCase().trim())
    )
  );
};

// Helper function to check if recipe matches nutrition criteria
const matchesNutritionCriteria = (recipe: any, nutritionFilters: any) => {
  if (!nutritionFilters) return true;

  const { 
    caloriesMin, caloriesMax, 
    proteinMin, proteinMax, 
    carbsMin, carbsMax, 
    fatMin, fatMax 
  } = nutritionFilters;

  if (caloriesMin !== undefined && recipe.calories < caloriesMin) return false;
  if (caloriesMax !== undefined && recipe.calories > caloriesMax) return false;
  if (proteinMin !== undefined && recipe.protein < proteinMin) return false;
  if (proteinMax !== undefined && recipe.protein > proteinMax) return false;
  if (carbsMin !== undefined && recipe.carbs < carbsMin) return false;
  if (carbsMax !== undefined && recipe.carbs > carbsMax) return false;
  if (fatMin !== undefined && recipe.fat < fatMin) return false;
  if (fatMax !== undefined && recipe.fat > fatMax) return false;

  return true;
};

// Helper function to check if recipe matches cook time criteria
const matchesCookTime = (recipe: any, cookTimeMin?: number, cookTimeMax?: number) => {
  if (cookTimeMin !== undefined && recipe.cookTime < cookTimeMin) return false;
  if (cookTimeMax !== undefined && recipe.cookTime > cookTimeMax) return false;
  return true;
};

// Helper function to check if recipe matches tags
const matchesTags = (recipe: any, tags: string[]) => {
  if (!tags || tags.length === 0) return true;
  
  const recipeTags = recipe.tags;
  return tags.some((tag: string) => recipeTags.includes(tag));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query parameters
      const { 
        limit = '24',
        offset = '0',
        mealType = 'all',
        cuisine = 'all',
        difficulty = 'all',
        sortBy = 'rating',
        search = '',
        personalized = 'false',
        suggestions = 'false', // Get personalized daily suggestions
        excludeIds = '', // Comma-separated list of recipe IDs to exclude from suggestions
        // Advanced search parameters
        ingredients, // comma-separated ingredient list
        tags,
        caloriesMin,
        caloriesMax,
        proteinMin,
        proteinMax,
        carbsMin,
        carbsMax,
        fatMin,
        fatMax,
        cookTimeMin,
        cookTimeMax,
        includeExternal = 'false' // Include external API results for worldwide recipes
      } = req.query;

    let user = null;
    let userPreferences = null;

    // Authentication and user preferences logic (existing code)
    if (personalized === 'true' || suggestions === 'true') {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      let token = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
        if (token) {
        try {
          // Verify JWT token
          const jwtSecret = process.env.NEXTAUTH_SECRET;
          if (!jwtSecret) {
            console.error('❌ NEXTAUTH_SECRET is not defined');
            return res.status(500).json({ error: 'Server configuration error' });
          }
          
          const decoded = jwt.verify(token, jwtSecret) as any;
          console.log('🔑 Token decoded successfully:', { userId: decoded.userId });
          
                     // Get user with preferences
           user = await prisma.user.findUnique({
             where: { id: decoded.userId }
           });
           
           if (user && (user.dietaryRestrictions || user.allergies || user.cuisinePreferences)) {
             console.log('👤 User found with preferences');
             
             // Parse user preferences from database
             try {
               userPreferences = {
                 dietaryRestrictions: user.dietaryRestrictions ? JSON.parse(user.dietaryRestrictions) : [],
                 allergies: user.allergies ? JSON.parse(user.allergies) : [],
                 cuisinePreferences: user.cuisinePreferences ? JSON.parse(user.cuisinePreferences) : [],
                 skillLevel: user.skillLevel || 'beginner'
               };
             } catch (error) {
               console.error('Error parsing user preferences:', error);
               userPreferences = {
                 dietaryRestrictions: [],
                 allergies: [],
                 cuisinePreferences: [],
                 skillLevel: 'beginner'
               };
             }
          } else {
            console.log('👤 User found but no preferences set');
            
            // For suggestions, redirect to preferences if no preferences set
            if (suggestions === 'true') {
              return res.status(200).json({
                needsPreferences: true,
                message: 'Please set your preferences first',
                redirectTo: '/preferences'
              });
            } else {
              // Use default preferences for search
              userPreferences = {
                dietaryRestrictions: [],
                allergies: [],
                cuisinePreferences: [],
                skillLevel: 'beginner'
              };
            }
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          
          if (suggestions === 'true') {
            return res.status(401).json({ error: 'Authentication required for suggestions' });
          } else {
            // Continue without personalization for regular search
            userPreferences = {
              dietaryRestrictions: [],
              allergies: [],
              cuisinePreferences: [],
              skillLevel: 'beginner'
            };
          }
        }
      } else {
        console.log('❌ No token found in request');
        
        if (suggestions === 'true') {
          return res.status(401).json({ error: 'Authentication required for suggestions' });
        } else {
          // Continue without personalization
          userPreferences = {
            dietaryRestrictions: [],
            allergies: [],
            cuisinePreferences: [],
            skillLevel: 'beginner'
          };
        }
      }
    }

          // Handle daily suggestions - return 3 personalized dishes (easy, medium, hard)
      if (suggestions === 'true' && userPreferences) {
        console.log('🎯 Getting 3 personalized suggestions for user with preferences:', userPreferences);
        console.log('🚫 Excluding recipe IDs:', excludeIds);
        
        // Parse excluded IDs
        const excludeIdArray = excludeIds ? (excludeIds as string).split(',').filter(id => id.trim()) : [];
        const excludeCondition = excludeIdArray.length > 0 ? { id: { notIn: excludeIdArray } } : {};
        
        // Build dietary restriction filters
        const dietaryFilters: any[] = [];
        
        // Always add exclude condition if present
        if (Object.keys(excludeCondition).length > 0) {
          dietaryFilters.push(excludeCondition);
        }
        
        // Vegetarian filter - STRICT exclusion of all non-vegetarian ingredients
        if (userPreferences.dietaryRestrictions.includes('vegetarian')) {
          console.log('🥗 Applying STRICT vegetarian filter - excluding ALL non-veg ingredients');
          
          // All meat types
          const meatKeywords = [
            'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'goose', 'veal', 'venison',
            'meat', 'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'chorizo', 'prosciutto'
          ];
          
          // All seafood/fish types (COMPREHENSIVE LIST)
          const seafoodKeywords = [
            'fish', 'salmon', 'tuna', 'cod', 'trout', 'bass', 'mackerel', 'sardines', 'anchovies',
            'shrimp', 'prawns', 'crab', 'lobster', 'oysters', 'mussels', 'clams', 'scallops',
            'seafood', 'shellfish', 'calamari', 'squid', 'octopus', 'eel', 'shark', 'halibut'
          ];
          
                     // Add all filters
           [...meatKeywords, ...seafoodKeywords].forEach(keyword => {
             dietaryFilters.push({ 
               ingredients: { 
                 not: { 
                   contains: keyword
                 } 
               } 
             });
             // Also check title for dishes named after the ingredient
             dietaryFilters.push({ 
               title: { 
                 not: { 
                   contains: keyword
                 } 
               } 
             });
           });
        }
        
        // STRICT Allergy filters - check both ingredients AND title
        if (userPreferences.allergies && userPreferences.allergies.length > 0) {
          console.log('🚫 Applying STRICT allergy filters:', userPreferences.allergies);
          for (const allergy of userPreferences.allergies) {
            // Check ingredients
            dietaryFilters.push({
              ingredients: { not: { contains: allergy } }
            });
            // Also check recipe title
            dietaryFilters.push({
              title: { not: { contains: allergy } }
            });
          }
        }
        
        const baseWhere = dietaryFilters.length > 0 ? { AND: dietaryFilters } : {};
        
        const suggestedRecipes = [];
        
        // 1. Get one EASY recipe (for beginners) - try local first, then external if enabled
        let easyRecipe = await prisma.recipe.findFirst({
          where: { 
            ...baseWhere,
            difficulty: 'easy'
          },
          include: {
            author: { select: { name: true, id: true } },
            _count: { select: { likes: true, savedBy: true, comments: true } }
          },
          orderBy: { rating: 'desc' }
        });
        
        if (easyRecipe) {
          suggestedRecipes.push(easyRecipe);
          excludeIdArray.push(easyRecipe.id);
        } else if (includeExternal === 'true') {
          // Get external easy recipe
          try {
            console.log('🌍 Getting external easy recipe from API');
            const externalRecipes = await getRandomTheMealDBRecipes(1);
            if (externalRecipes.length > 0) {
              const convertedRecipe = convertExternalToLocal(externalRecipes[0]);
              convertedRecipe.difficulty = 'easy';
              suggestedRecipes.push(convertedRecipe);
            }
          } catch (error) {
            console.error('Error fetching external easy recipe:', error);
          }
        }
        
        // 2. Get one MEDIUM recipe (intermediate) - try local first, then external if enabled
        let mediumRecipe = await prisma.recipe.findFirst({
          where: { 
            ...baseWhere,
            difficulty: 'medium',
            id: { notIn: excludeIdArray }
          },
          include: {
            author: { select: { name: true, id: true } },
            _count: { select: { likes: true, savedBy: true, comments: true } }
          },
          orderBy: { rating: 'desc' }
        });
        
        if (mediumRecipe) {
          suggestedRecipes.push(mediumRecipe);
          excludeIdArray.push(mediumRecipe.id);
        } else if (includeExternal === 'true') {
          // Get external medium recipe
          try {
            console.log('🌍 Getting external medium recipe from API');
            const externalRecipes = await getRandomTheMealDBRecipes(1);
            if (externalRecipes.length > 0) {
              const convertedRecipe = convertExternalToLocal(externalRecipes[0]);
              convertedRecipe.difficulty = 'medium';
              suggestedRecipes.push(convertedRecipe);
            }
          } catch (error) {
            console.error('Error fetching external medium recipe:', error);
          }
        }
        
        // 3. Get one HARD recipe (challenging) - try local first, then external if enabled
        let hardRecipe = await prisma.recipe.findFirst({
          where: { 
            ...baseWhere,
            difficulty: 'hard',
            id: { notIn: excludeIdArray }
          },
          include: {
            author: { select: { name: true, id: true } },
            _count: { select: { likes: true, savedBy: true, comments: true } }
          },
          orderBy: { rating: 'desc' }
        });
        
        if (hardRecipe) {
          suggestedRecipes.push(hardRecipe);
          excludeIdArray.push(hardRecipe.id);
        } else if (includeExternal === 'true') {
          // Get external hard recipe
          try {
            console.log('🌍 Getting external hard recipe from API');
            const externalRecipes = await getRandomTheMealDBRecipes(1);
            if (externalRecipes.length > 0) {
              const convertedRecipe = convertExternalToLocal(externalRecipes[0]);
              convertedRecipe.difficulty = 'hard';
              suggestedRecipes.push(convertedRecipe);
            }
          } catch (error) {
            console.error('Error fetching external hard recipe:', error);
          }
        }
      
              // Parse JSON fields and return suggestions (only from local database)
        const processedSuggestions = suggestedRecipes.map((recipe: any) => {
          let ingredients = [];
          let instructions = [];
          let tags = [];
          
          try {
            ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients || [];
          } catch (error) {
            console.error('Error parsing ingredients for recipe:', recipe.id);
            ingredients = [];
          }
          
          try {
            instructions = typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions || [];
          } catch (error) {
            console.error('Error parsing instructions for recipe:', recipe.id);
            instructions = [];
          }
          
          try {
            tags = typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags || [];
          } catch (error) {
            console.error('Error parsing tags for recipe:', recipe.id);
            tags = [];
          }
          
          return {
            ...recipe,
            ingredients,
            instructions,
            tags,
            isLiked: false,
            isSaved: false
          };
        });
        
        console.log(`✅ Returning ${processedSuggestions.length} personalized suggestions (Easy, Medium, Hard)`);
        return res.status(200).json({ 
          recipes: processedSuggestions, 
          total: processedSuggestions.length,
          personalized: true,
          suggestions: true,
          includesExternal: includeExternal === 'true',
          difficulty_breakdown: {
            easy: processedSuggestions.filter(r => r.difficulty === 'easy').length,
            medium: processedSuggestions.filter(r => r.difficulty === 'medium').length,
            hard: processedSuggestions.filter(r => r.difficulty === 'hard').length
          }
        });
    }

    // **🔍 INGREDIENT SEARCH - ONLY LOCAL DATABASE RECIPES**
    if (ingredients) {
      console.log('🔍 Searching for ingredients in local database:', ingredients);
      
      const ingredientList = (ingredients as string).split(',').map(ing => ing.trim());
      
      // Build where clause for ingredient search (SQLite doesn't support mode: 'insensitive')
      const ingredientWhere: any = {
        AND: [
          ...ingredientList.map(ingredient => ({
            ingredients: { contains: ingredient }
          }))
        ]
      };

      // Add dietary restriction filters
      if (userPreferences && personalized === 'true') {
        // STRICT Vegetarian filter - same as suggestions
        if (userPreferences.dietaryRestrictions.includes('vegetarian')) {
          console.log('🥗 Applying STRICT vegetarian filter to ingredient search');
          
          // All meat types
          const meatKeywords = [
            'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'goose', 'veal', 'venison',
            'meat', 'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'chorizo', 'prosciutto'
          ];
          
          // All seafood/fish types (COMPREHENSIVE LIST)
          const seafoodKeywords = [
            'fish', 'salmon', 'tuna', 'cod', 'trout', 'bass', 'mackerel', 'sardines', 'anchovies',
            'shrimp', 'prawns', 'crab', 'lobster', 'oysters', 'mussels', 'clams', 'scallops',
            'seafood', 'shellfish', 'calamari', 'squid', 'octopus', 'eel', 'shark', 'halibut'
          ];
          
          // Add all filters to ingredient search
          [...meatKeywords, ...seafoodKeywords].forEach(keyword => {
            ingredientWhere.AND.push({ 
              ingredients: { not: { contains: keyword } } 
            });
            ingredientWhere.AND.push({ 
              title: { not: { contains: keyword } } 
            });
          });
        }
        
        // STRICT Allergy filters - check both ingredients AND title
        if (userPreferences.allergies && userPreferences.allergies.length > 0) {
          console.log('🚫 Applying STRICT allergy filters to ingredient search:', userPreferences.allergies);
          for (const allergy of userPreferences.allergies) {
            ingredientWhere.AND.push({
              ingredients: { not: { contains: allergy } }
            });
            ingredientWhere.AND.push({
              title: { not: { contains: allergy } }
            });
          }
        }
      }

      try {
        // Get total count for pagination
        const totalCount = await prisma.recipe.count({
          where: ingredientWhere
        });

        // Get recipes with pagination from local database
        const localRecipes = await prisma.recipe.findMany({
          where: ingredientWhere,
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
          take: parseInt(limit as string) || 10,
          skip: parseInt(offset as string) || 0,
          orderBy: { rating: 'desc' }
        });

        let allRecipes = [...localRecipes];
        let totalWithExternal = totalCount;

        // If external API is enabled and we need more recipes, fetch from external sources
        if (includeExternal === 'true') {
          console.log('🌍 Including external recipes for ingredient search');
          
          for (const ingredient of ingredientList) {
            try {
              const externalRecipes = await searchTheMealDBByIngredient(ingredient);
              const convertedRecipes = externalRecipes.map(recipe => convertExternalToLocal(recipe));
              
              // Filter external recipes by dietary preferences if needed
              let filteredExternalRecipes = convertedRecipes;
              if (userPreferences && personalized === 'true') {
                filteredExternalRecipes = convertedRecipes.filter(recipe => {
                  // Apply vegetarian filter
                  if (userPreferences.dietaryRestrictions.includes('vegetarian')) {
                    const ingredientsStr = typeof recipe.ingredients === 'string' 
                      ? recipe.ingredients.toLowerCase() 
                      : JSON.stringify(recipe.ingredients).toLowerCase();
                    
                    const nonVegKeywords = ['chicken', 'beef', 'pork', 'fish', 'meat', 'lamb', 'turkey', 'seafood', 'salmon', 'tuna', 'shrimp'];
                    if (nonVegKeywords.some(keyword => ingredientsStr.includes(keyword))) {
                      return false;
                    }
                  }
                  
                  // Apply allergy filter
                  if (userPreferences.allergies && userPreferences.allergies.length > 0) {
                    const ingredientsStr = typeof recipe.ingredients === 'string' 
                      ? recipe.ingredients.toLowerCase() 
                      : JSON.stringify(recipe.ingredients).toLowerCase();
                    
                                         if (userPreferences.allergies.some((allergy: string) => ingredientsStr.includes(allergy.toLowerCase()))) {
                      return false;
                    }
                  }
                  
                  return true;
                });
              }
              
              allRecipes.push(...filteredExternalRecipes);
              totalWithExternal += filteredExternalRecipes.length;
              
              console.log(`🌍 Added ${filteredExternalRecipes.length} external recipes for ${ingredient}`);
            } catch (error) {
              console.error(`Error fetching external recipes for ${ingredient}:`, error);
            }
          }
        }

        console.log(`📊 Found ${allRecipes.length} recipes (${localRecipes.length} local, ${allRecipes.length - localRecipes.length} external)`);

        // Process JSON fields for frontend
        const processedRecipes = allRecipes.map((recipe: any) => {
          let ingredients = [];
          let instructions = [];
          let tags = [];
          
          try {
            ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients || [];
          } catch (error) {
            ingredients = [];
          }
          
          try {
            instructions = typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions || [];
          } catch (error) {
            instructions = [];
          }
          
          try {
            tags = typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags || [];
          } catch (error) {
            tags = [];
          }
          
          return {
            ...recipe,
            ingredients,
            instructions,
            tags,
            isLiked: false,
            isSaved: false
          };
        });

        console.log(`✅ Returning ${processedRecipes.length} ingredient-based recipes`);
        return res.status(200).json({ 
          recipes: processedRecipes,
          total: totalWithExternal,
          hasMore: (parseInt(offset as string) || 0) + allRecipes.length < totalWithExternal,
          personalized: personalized === 'true',
          searched_ingredients: ingredientList,
          includesExternal: includeExternal === 'true'
        });
      } catch (error) {
        console.error('Error searching ingredient recipes:', error);
        return res.status(500).json({ error: 'Failed to search recipes by ingredients' });
      }
    }

    // **🔍 REGULAR SEARCH (existing functionality)**
    // Build where clause for database query
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
          { title: { contains: search as string } },
          { description: { contains: search as string } },
          { cuisine: { contains: search as string } },
          { ingredients: { contains: search as string } },
          { tags: { contains: search as string } }
        ];
      }

    // Apply user preference filtering
    if (personalized === 'true' && userPreferences) {
      console.log('🎯 Applying personalized filtering');
      
      // Filter by dietary restrictions
      if (userPreferences.dietaryRestrictions.length > 0) {
        for (const restriction of userPreferences.dietaryRestrictions) {
          if (restriction === 'vegetarian') {
            where.AND = where.AND || [];
            where.AND.push({
              AND: [
                { ingredients: { not: { contains: 'chicken' } } },
                { ingredients: { not: { contains: 'beef' } } },
                { ingredients: { not: { contains: 'pork' } } },
                { ingredients: { not: { contains: 'fish' } } },
                { ingredients: { not: { contains: 'meat' } } }
              ]
            });
          }
        }
      }
    }

    // Build order clause
    let orderBy: any;
      switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
        case 'cookTime':
          orderBy = { cookTime: 'asc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
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
        orderBy,
        take: parseInt(limit as string) * 3, // Get more to filter down with advanced criteria
        skip: parseInt(offset as string)
      });

    // Parse JSON fields for frontend with safe parsing
    let recipesWithParsedData = recipes.map((recipe: any) => {
      let ingredients = [];
      let instructions = [];
      let tags = [];
      
      // Safe JSON parsing for ingredients
      try {
        if (typeof recipe.ingredients === 'string') {
          ingredients = JSON.parse(recipe.ingredients);
        } else if (Array.isArray(recipe.ingredients)) {
          ingredients = recipe.ingredients;
        }
      } catch (error) {
        console.error('Error parsing ingredients for recipe:', recipe.id);
        ingredients = [];
      }
      
      // Safe JSON parsing for instructions  
      try {
        if (typeof recipe.instructions === 'string') {
          instructions = JSON.parse(recipe.instructions);
        } else if (Array.isArray(recipe.instructions)) {
          instructions = recipe.instructions;
        }
    } catch (error) {
        console.error('Error parsing instructions for recipe:', recipe.id);
        instructions = [];
      }
      
      // Safe JSON parsing for tags
      try {
        if (typeof recipe.tags === 'string') {
          tags = JSON.parse(recipe.tags);
        } else if (Array.isArray(recipe.tags)) {
          tags = recipe.tags;
        }
      } catch (error) {
        console.error('Error parsing tags for recipe:', recipe.id);
        tags = [];
      }
      
      return {
        ...recipe,
        ingredients,
        instructions,
        tags
      };
    });

    // Apply advanced filtering to parsed data
    if (caloriesMin || caloriesMax || proteinMin || proteinMax || carbsMin || carbsMax || 
        fatMin || fatMax || cookTimeMin || cookTimeMax) {
      recipesWithParsedData = recipesWithParsedData.filter(recipe => {
        // Apply calorie filters
        if (caloriesMin && recipe.calories < parseInt(caloriesMin as string)) return false;
        if (caloriesMax && recipe.calories > parseInt(caloriesMax as string)) return false;
        
        // Apply cook time filters
        if (cookTimeMin && recipe.cookTime < parseInt(cookTimeMin as string)) return false;
        if (cookTimeMax && recipe.cookTime > parseInt(cookTimeMax as string)) return false;
        
        return true;
      });
    }

    // Apply final limit after filtering
    const finalRecipes = recipesWithParsedData.slice(0, parseInt(limit as string));

    console.log(`✅ Returning ${finalRecipes.length} regular search results`);
    return res.status(200).json({ 
      recipes: finalRecipes,
      total: finalRecipes.length,
      personalized: personalized === 'true'
    });

  } catch (error) {
    console.error('❌ Error in recipes API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
} 