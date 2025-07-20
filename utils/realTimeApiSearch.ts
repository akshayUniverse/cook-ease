// Real-time API search for unlimited recipe results

export interface ExternalRecipe {
  id: string;
  title: string;
  image: string;
  cuisine: string;
  difficulty: string;
  cookTime: number;
  rating: number;
  calories?: number;
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  mealType: string;
  source: 'themealdb' | 'spoonacular';
}

// Search TheMealDB by ingredient
export async function searchTheMealDBByIngredient(ingredient: string): Promise<ExternalRecipe[]> {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
    
    if (!response.ok) {
      console.error('TheMealDB API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.meals) {
      return [];
    }

    // Get detailed recipe information for each meal
    const detailedRecipes = await Promise.all(
      data.meals.slice(0, 20).map(async (meal: any) => {
        try {
          const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const detailData = await detailResponse.json();
          
          if (detailData.meals && detailData.meals[0]) {
            const detailedMeal = detailData.meals[0];
            
            // Extract ingredients
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = detailedMeal[`strIngredient${i}`];
              const measure = detailedMeal[`strMeasure${i}`];
              if (ingredient && ingredient.trim()) {
                ingredients.push(measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim());
              }
            }
            
            // Extract instructions
            const instructions = detailedMeal.strInstructions 
              ? detailedMeal.strInstructions.split(/\r?\n/).filter((inst: string) => inst.trim()).slice(0, 10)
              : [];
            
            return {
              id: `themealdb_${detailedMeal.idMeal}`,
              title: detailedMeal.strMeal,
              image: detailedMeal.strMealThumb,
              cuisine: detailedMeal.strArea || 'International',
              difficulty: 'medium', // TheMealDB doesn't have difficulty
              cookTime: 30, // Default cook time
              rating: 4.0 + Math.random() * 1.0, // Random rating between 4-5
              calories: Math.floor(300 + Math.random() * 400), // Random calories 300-700
              description: detailedMeal.strInstructions ? detailedMeal.strInstructions.slice(0, 150) + '...' : 'Delicious recipe from TheMealDB',
              ingredients,
              instructions,
              tags: [detailedMeal.strCategory, detailedMeal.strArea].filter(Boolean),
              mealType: getCategoryToMealType(detailedMeal.strCategory),
              source: 'themealdb' as const
            };
          }
        } catch (error) {
          console.error('Error fetching meal details:', error);
          return null;
        }
      })
    );
    
    return detailedRecipes.filter(recipe => recipe !== null) as ExternalRecipe[];
    
  } catch (error) {
    console.error('Error searching TheMealDB:', error);
    return [];
  }
}

// Search TheMealDB by category/cuisine for suggestions
export async function searchTheMealDBByCuisine(cuisine: string): Promise<ExternalRecipe[]> {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(cuisine)}`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.meals) {
      return [];
    }

    // Get detailed recipe information for first 10 meals
    const detailedRecipes = await Promise.all(
      data.meals.slice(0, 10).map(async (meal: any) => {
        try {
          const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const detailData = await detailResponse.json();
          
          if (detailData.meals && detailData.meals[0]) {
            const detailedMeal = detailData.meals[0];
            
            // Extract ingredients
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = detailedMeal[`strIngredient${i}`];
              const measure = detailedMeal[`strMeasure${i}`];
              if (ingredient && ingredient.trim()) {
                ingredients.push(measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim());
              }
            }
            
            // Extract instructions
            const instructions = detailedMeal.strInstructions 
              ? detailedMeal.strInstructions.split(/\r?\n/).filter((inst: string) => inst.trim()).slice(0, 10)
              : [];
            
            return {
              id: `themealdb_${detailedMeal.idMeal}`,
              title: detailedMeal.strMeal,
              image: detailedMeal.strMealThumb,
              cuisine: detailedMeal.strArea || 'International',
              difficulty: 'medium',
              cookTime: 30,
              rating: 4.0 + Math.random() * 1.0,
              calories: Math.floor(300 + Math.random() * 400),
              description: detailedMeal.strInstructions ? detailedMeal.strInstructions.slice(0, 150) + '...' : 'Delicious recipe from TheMealDB',
              ingredients,
              instructions,
              tags: [detailedMeal.strCategory, detailedMeal.strArea].filter(Boolean),
              mealType: getCategoryToMealType(detailedMeal.strCategory),
              source: 'themealdb' as const
            };
          }
        } catch (error) {
          console.error('Error fetching meal details:', error);
          return null;
        }
      })
    );
    
    return detailedRecipes.filter(recipe => recipe !== null) as ExternalRecipe[];
    
  } catch (error) {
    console.error('Error searching TheMealDB by cuisine:', error);
    return [];
  }
}

// Search random recipes from TheMealDB for suggestions
export async function getRandomTheMealDBRecipes(count: number = 10): Promise<ExternalRecipe[]> {
  try {
    const recipes = [];
    
    // Fetch multiple random recipes
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        
        if (!response.ok) {
          continue;
        }
        
        const data = await response.json();
        
        if (data.meals && data.meals[0]) {
          const meal = data.meals[0];
          
          // Extract ingredients
          const ingredients = [];
          for (let j = 1; j <= 20; j++) {
            const ingredient = meal[`strIngredient${j}`];
            const measure = meal[`strMeasure${j}`];
            if (ingredient && ingredient.trim()) {
              ingredients.push(measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim());
            }
          }
          
          // Extract instructions
          const instructions = meal.strInstructions 
            ? meal.strInstructions.split(/\r?\n/).filter((inst: string) => inst.trim()).slice(0, 10)
            : [];
          
          recipes.push({
            id: `themealdb_${meal.idMeal}`,
            title: meal.strMeal,
            image: meal.strMealThumb,
            cuisine: meal.strArea || 'International',
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)], // Random difficulty
            cookTime: Math.floor(20 + Math.random() * 60), // Random 20-80 minutes
            rating: 3.5 + Math.random() * 1.5, // Random rating 3.5-5
            calories: Math.floor(250 + Math.random() * 500), // Random 250-750 calories
            description: meal.strInstructions ? meal.strInstructions.slice(0, 150) + '...' : 'Delicious recipe from TheMealDB',
            ingredients,
            instructions,
            tags: [meal.strCategory, meal.strArea].filter(Boolean),
            mealType: getCategoryToMealType(meal.strCategory),
            source: 'themealdb' as const
          });
        }
      } catch (error) {
        console.error('Error fetching random recipe:', error);
      }
    }
    
    return recipes;
    
  } catch (error) {
    console.error('Error getting random TheMealDB recipes:', error);
    return [];
  }
}

// Helper function to convert TheMealDB category to meal type
function getCategoryToMealType(category: string): string {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('breakfast') || categoryLower.includes('starter')) {
    return 'breakfast';
  } else if (categoryLower.includes('dessert') || categoryLower.includes('sweet')) {
    return 'dessert';
  } else if (categoryLower.includes('side')) {
    return 'lunch';
  } else {
    return 'dinner';
  }
}

// Convert external recipe to local database format for consistent response
export function convertExternalToLocal(recipe: ExternalRecipe): any {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    ingredients: JSON.stringify(recipe.ingredients),
    instructions: JSON.stringify(recipe.instructions),
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    mealType: recipe.mealType,
    image: recipe.image,
    rating: parseFloat(recipe.rating.toFixed(1)),
    calories: recipe.calories || null,
    tags: JSON.stringify(recipe.tags),
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: null,
    author: null,
    _count: {
      likes: 0,
      savedBy: 0,
      comments: 0
    },
    isLiked: false,
    isSaved: false,
    source: recipe.source
  };
} 