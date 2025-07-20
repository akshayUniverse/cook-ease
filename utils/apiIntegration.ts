// API Integration Utilities for Recipe, Nutrition, and Image Data
import { NextApiRequest, NextApiResponse } from 'next';

// API Configuration
const API_CONFIG = {
  // TheMealDB - Completely Free
  MEALDB_BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
  
  // Spoonacular - Free tier: 150 requests/day
  SPOONACULAR_BASE_URL: 'https://api.spoonacular.com/recipes',
  SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY || '',
  
  // Unsplash - Free tier: 50 requests/hour
  UNSPLASH_BASE_URL: 'https://api.unsplash.com',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
  
  // Pexels - Free tier: 200 requests/hour
  PEXELS_BASE_URL: 'https://api.pexels.com/v1',
  PEXELS_API_KEY: process.env.PEXELS_API_KEY || '',
};

// Type definitions
export interface RecipeData {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  ingredients: Array<{
    name: string;
    amount: string;
    unit?: string;
  }>;
  instructions: string[];
  tags: string[];
  source: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  vitaminC?: number;
}

// TheMealDB API Integration
export class TheMealDBAPI {
  private baseUrl = API_CONFIG.MEALDB_BASE_URL;

  // Get recipes by cuisine (Indian, Italian, etc.)
  async getRecipesByCuisine(cuisine: string): Promise<RecipeData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/filter.php?a=${cuisine}`);
      const data = await response.json();
      
      if (!data.meals) return [];
      
      // Get detailed recipe info for each meal
      const recipes: RecipeData[] = [];
      for (const meal of data.meals.slice(0, 10)) { // Limit to 10 recipes
        const detailedRecipe = await this.getRecipeById(meal.idMeal);
        if (detailedRecipe) recipes.push(detailedRecipe);
      }
      
      return recipes;
    } catch (error) {
      console.error('Error fetching recipes by cuisine:', error);
      return [];
    }
  }

  // Get detailed recipe by ID
  async getRecipeById(id: string): Promise<RecipeData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/lookup.php?i=${id}`);
      const data = await response.json();
      
      if (!data.meals || !data.meals[0]) return null;
      
      const meal = data.meals[0];
      return this.transformMealToRecipe(meal);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  }

  // Get random recipes
  async getRandomRecipes(count: number = 5): Promise<RecipeData[]> {
    try {
      const recipes: RecipeData[] = [];
      
      for (let i = 0; i < count; i++) {
        const response = await fetch(`${this.baseUrl}/random.php`);
        const data = await response.json();
        
        if (data.meals && data.meals[0]) {
          const recipe = this.transformMealToRecipe(data.meals[0]);
          recipes.push(recipe);
        }
      }
      
      return recipes;
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      return [];
    }
  }

  // Transform TheMealDB format to our format
  private transformMealToRecipe(meal: any): RecipeData {
    // Extract ingredients
    const ingredients: Array<{name: string; amount: string}> = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          amount: measure ? measure.trim() : '1 piece'
        });
      }
    }

    // Extract instructions
    const instructions = meal.strInstructions
      ? meal.strInstructions.split(/\r?\n/).filter((step: string) => step.trim())
      : [];

    // Determine meal type based on tags or category
    const mealType = this.determineMealType(meal.strCategory, meal.strTags);
    
    // Generate nutrition estimates (since TheMealDB doesn't provide nutrition)
    const nutrition = this.estimateNutrition(ingredients.length, meal.strCategory);

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      description: meal.strInstructions?.substring(0, 200) + '...' || 'Delicious traditional recipe',
      image: meal.strMealThumb,
      cookTime: this.estimateCookTime(instructions.length),
      servings: 4,
      difficulty: this.estimateDifficulty(instructions.length, ingredients.length),
      cuisine: meal.strArea?.toLowerCase() || 'international',
      mealType,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      sugar: nutrition.sugar,
      sodium: nutrition.sodium,
      ingredients,
      instructions,
      tags: this.extractTags(meal.strCategory, meal.strTags, meal.strArea),
      source: 'TheMealDB'
    };
  }

  private determineMealType(category: string, tags: string): string {
    if (!category) return 'dinner';
    
    const cat = category.toLowerCase();
    if (cat.includes('breakfast')) return 'breakfast';
    if (cat.includes('dessert') || cat.includes('sweet')) return 'snack';
    if (cat.includes('starter') || cat.includes('side')) return 'snack';
    return 'dinner';
  }

  private estimateCookTime(instructionCount: number): number {
    // Estimate based on instruction complexity
    if (instructionCount <= 3) return 15;
    if (instructionCount <= 5) return 30;
    if (instructionCount <= 8) return 45;
    return 60;
  }

  private estimateDifficulty(instructionCount: number, ingredientCount: number): string {
    const complexity = instructionCount + (ingredientCount * 0.5);
    if (complexity <= 8) return 'easy';
    if (complexity <= 15) return 'medium';
    return 'hard';
  }

  private estimateNutrition(ingredientCount: number, category: string): NutritionData {
    // Basic nutrition estimation based on category and ingredients
    let baseCalories = 300;
    
    if (category?.toLowerCase().includes('dessert')) baseCalories = 450;
    if (category?.toLowerCase().includes('chicken')) baseCalories = 400;
    if (category?.toLowerCase().includes('beef')) baseCalories = 500;
    if (category?.toLowerCase().includes('vegetarian')) baseCalories = 250;
    
    const calories = baseCalories + (ingredientCount * 20);
    
    return {
      calories,
      protein: Math.round(calories * 0.2 / 4), // 20% protein
      carbs: Math.round(calories * 0.5 / 4), // 50% carbs
      fat: Math.round(calories * 0.3 / 9), // 30% fat
      fiber: Math.round(ingredientCount * 0.5),
      sugar: Math.round(calories * 0.1 / 4),
      sodium: Math.round(calories * 2) // mg
    };
  }

  private extractTags(category: string, tags: string, area: string): string[] {
    const tagArray: string[] = [];
    
    if (category) tagArray.push(category.toLowerCase());
    if (area) tagArray.push(area.toLowerCase());
    
    if (tags) {
      const splitTags = tags.split(',').map(tag => tag.trim().toLowerCase());
      tagArray.push(...splitTags);
    }
    
    // Add common tags
    tagArray.push('traditional', 'authentic');
    
    return Array.from(new Set(tagArray)); // Remove duplicates
  }
}

// Spoonacular API Integration
export class SpoonacularAPI {
  private baseUrl = API_CONFIG.SPOONACULAR_BASE_URL;
  private apiKey = API_CONFIG.SPOONACULAR_API_KEY;

  // Get detailed nutrition for a recipe
  async getRecipeNutrition(recipeId: string): Promise<NutritionData | null> {
    if (!this.apiKey) {
      console.warn('Spoonacular API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${recipeId}/nutritionWidget.json?apiKey=${this.apiKey}`
      );
      const data = await response.json();
      
      return {
        calories: data.calories || 0,
        protein: this.extractNutrient(data.nutrients, 'Protein'),
        carbs: this.extractNutrient(data.nutrients, 'Carbohydrates'),
        fat: this.extractNutrient(data.nutrients, 'Fat'),
        fiber: this.extractNutrient(data.nutrients, 'Fiber'),
        sugar: this.extractNutrient(data.nutrients, 'Sugar'),
        sodium: this.extractNutrient(data.nutrients, 'Sodium'),
        calcium: this.extractNutrient(data.nutrients, 'Calcium'),
        iron: this.extractNutrient(data.nutrients, 'Iron'),
        vitaminC: this.extractNutrient(data.nutrients, 'Vitamin C'),
      };
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      return null;
    }
  }

  // Search for recipes with nutrition data
  async searchRecipes(query: string, cuisine?: string, diet?: string): Promise<RecipeData[]> {
    if (!this.apiKey) {
      console.warn('Spoonacular API key not configured');
      return [];
    }

    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        query,
        number: '12',
        addRecipeInformation: 'true',
        addRecipeNutrition: 'true',
        fillIngredients: 'true'
      });

      if (cuisine) params.append('cuisine', cuisine);
      if (diet) params.append('diet', diet);

      const response = await fetch(`${this.baseUrl}/complexSearch?${params}`);
      const data = await response.json();
      
      if (!data.results) return [];
      
      return data.results.map((recipe: any) => this.transformSpoonacularRecipe(recipe));
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  }

  private extractNutrient(nutrients: any[], name: string): number {
    const nutrient = nutrients?.find(n => n.name === name);
    return nutrient ? Math.round(nutrient.amount) : 0;
  }

  private transformSpoonacularRecipe(recipe: any): RecipeData {
    return {
      id: recipe.id.toString(),
      title: recipe.title,
      description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Delicious recipe',
      image: recipe.image,
      cookTime: recipe.readyInMinutes || 30,
      servings: recipe.servings || 4,
      difficulty: recipe.veryHealthy ? 'easy' : 'medium',
      cuisine: recipe.cuisines?.[0]?.toLowerCase() || 'international',
      mealType: this.determineMealType(recipe.dishTypes),
      calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 400,
      protein: this.extractNutrient(recipe.nutrition?.nutrients, 'Protein'),
      carbs: this.extractNutrient(recipe.nutrition?.nutrients, 'Carbohydrates'),
      fat: this.extractNutrient(recipe.nutrition?.nutrients, 'Fat'),
      fiber: this.extractNutrient(recipe.nutrition?.nutrients, 'Fiber'),
      sugar: this.extractNutrient(recipe.nutrition?.nutrients, 'Sugar'),
      sodium: this.extractNutrient(recipe.nutrition?.nutrients, 'Sodium'),
      ingredients: recipe.extendedIngredients?.map((ing: any) => ({
        name: ing.original || ing.name,
        amount: `${ing.amount || 1} ${ing.unit || 'piece'}`
      })) || [],
      instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || [],
      tags: [...(recipe.dishTypes || []), ...(recipe.diets || [])],
      source: 'Spoonacular'
    };
  }

  private determineMealType(dishTypes: string[]): string {
    if (!dishTypes) return 'dinner';
    
    const types = dishTypes.map(type => type.toLowerCase());
    if (types.some(type => type.includes('breakfast'))) return 'breakfast';
    if (types.some(type => type.includes('lunch'))) return 'lunch';
    if (types.some(type => type.includes('dessert') || type.includes('snack'))) return 'snack';
    return 'dinner';
  }
}

// Image API Integration
export class ImageAPI {
  private unsplashKey = API_CONFIG.UNSPLASH_ACCESS_KEY;
  private pexelsKey = API_CONFIG.PEXELS_API_KEY;

  // Get high-quality food images from Unsplash
  async getUnsplashImage(query: string): Promise<string | null> {
    if (!this.unsplashKey) {
      console.warn('Unsplash API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query + ' food')}&per_page=1&orientation=landscape&client_id=${this.unsplashKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        return data.results[0].urls.regular;
      }
      return null;
    } catch (error) {
      console.error('Error fetching Unsplash image:', error);
      return null;
    }
  }

  // Get high-quality food images from Pexels
  async getPexelsImage(query: string): Promise<string | null> {
    if (!this.pexelsKey) {
      console.warn('Pexels API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.PEXELS_BASE_URL}/search?query=${encodeURIComponent(query + ' food')}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': this.pexelsKey
          }
        }
      );
      const data = await response.json();
      
      if (data.photos && data.photos[0]) {
        return data.photos[0].src.large;
      }
      return null;
    } catch (error) {
      console.error('Error fetching Pexels image:', error);
      return null;
    }
  }

  // Get the best available image for a recipe
  async getRecipeImage(recipeName: string, existingImage?: string): Promise<string> {
    // If recipe already has a good image, use it
    if (existingImage && existingImage.includes('http')) {
      return existingImage;
    }

    // Try Unsplash first
    const unsplashImage = await this.getUnsplashImage(recipeName);
    if (unsplashImage) return unsplashImage;

    // Try Pexels as fallback
    const pexelsImage = await this.getPexelsImage(recipeName);
    if (pexelsImage) return pexelsImage;

    // Return default placeholder
    return '/images/dishes/default-recipe.jpg';
  }
}

// Main API Service
export class RecipeAPIService {
  private mealDB = new TheMealDBAPI();
  private spoonacular = new SpoonacularAPI();
  private imageAPI = new ImageAPI();

  // Get comprehensive recipe data with nutrition and images
  async getEnhancedRecipes(options: {
    cuisine?: string;
    count?: number;
    includeNutrition?: boolean;
    includeImages?: boolean;
  } = {}): Promise<RecipeData[]> {
    const { cuisine = 'Indian', count = 20, includeNutrition = true, includeImages = true } = options;
    
    console.log(`Fetching ${count} ${cuisine} recipes...`);
    
    try {
      // Get recipes from TheMealDB
      const recipes = await this.mealDB.getRecipesByCuisine(cuisine);
      
      // Enhance with better images if requested
      if (includeImages) {
        for (const recipe of recipes) {
          const enhancedImage = await this.imageAPI.getRecipeImage(recipe.title, recipe.image);
          recipe.image = enhancedImage;
        }
      }
      
      // Add more recipes from random selection if we need more
      if (recipes.length < count) {
        const randomRecipes = await this.mealDB.getRandomRecipes(count - recipes.length);
        
        if (includeImages) {
          for (const recipe of randomRecipes) {
            const enhancedImage = await this.imageAPI.getRecipeImage(recipe.title, recipe.image);
            recipe.image = enhancedImage;
          }
        }
        
        recipes.push(...randomRecipes);
      }
      
      console.log(`Successfully fetched ${recipes.length} recipes`);
      return recipes.slice(0, count);
    } catch (error) {
      console.error('Error fetching enhanced recipes:', error);
      return [];
    }
  }

  // Get recipes with Spoonacular nutrition data
  async getRecipesWithSpoonacularNutrition(cuisine: string = 'Indian', count: number = 10): Promise<RecipeData[]> {
    try {
      const recipes = await this.spoonacular.searchRecipes('', cuisine);
      
      // Enhance with better images
      for (const recipe of recipes) {
        const enhancedImage = await this.imageAPI.getRecipeImage(recipe.title, recipe.image);
        recipe.image = enhancedImage;
      }
      
      return recipes.slice(0, count);
    } catch (error) {
      console.error('Error fetching Spoonacular recipes:', error);
      return [];
    }
  }
}

// Export default instance
export const recipeAPIService = new RecipeAPIService(); 