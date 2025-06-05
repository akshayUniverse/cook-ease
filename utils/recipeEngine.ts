interface Recipe {
  id: string;
  title: string;
  image: string;
  price?: number;
  rating?: number;
  cookTime?: string;
  calories?: number;
  category: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
}

interface UserPreferences {
  dietaryRestrictions?: string[];
  allergies?: string[];
  cuisinePreferences?: string[];
  skillLevel?: string;
  mealTypes?: string[];
}

// Mock database of recipes
const recipeDatabase: Recipe[] = [
  // Recipes would be populated here
];

/**
 * Filter recipes based on user preferences
 */
export const filterRecipesByPreferences = (
  recipes: Recipe[],
  preferences: UserPreferences
): Recipe[] => {
  return recipes.filter((recipe) => {
    // Filter out recipes with allergens
    if (
      preferences.allergies &&
      preferences.allergies.some((allergen) =>
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(allergen.toLowerCase())
        )
      )
    ) {
      return false;
    }

    // Filter by dietary restrictions
    if (
      preferences.dietaryRestrictions &&
      preferences.dietaryRestrictions.length > 0 &&
      !preferences.dietaryRestrictions.some((restriction) =>
        recipe.tags?.includes(restriction)
      )
    ) {
      return false;
    }

    // Filter by cuisine preferences if specified
    if (
      preferences.cuisinePreferences &&
      preferences.cuisinePreferences.length > 0 &&
      !preferences.cuisinePreferences.some((cuisine) =>
        recipe.tags?.includes(cuisine)
      )
    ) {
      return false;
    }

    // Filter by meal type if specified
    if (
      preferences.mealTypes &&
      preferences.mealTypes.length > 0 &&
      !preferences.mealTypes.some((mealType) => recipe.tags?.includes(mealType))
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Get personalized recipe recommendations
 */
export const getPersonalizedRecipes = (
  preferences: UserPreferences,
  limit: number = 10
): Recipe[] => {
  // Filter recipes by user preferences
  const filteredRecipes = filterRecipesByPreferences(recipeDatabase, preferences);

  // Sort by rating (could be enhanced with more sophisticated recommendation algorithm)
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    return (b.rating || 0) - (a.rating || 0);
  });

  // Return limited number of recipes
  return sortedRecipes.slice(0, limit);
};

/**
 * Search recipes by query
 */
export const searchRecipes = (query: string): Recipe[] => {
  const searchTerms = query.toLowerCase().split(" ");

  return recipeDatabase.filter((recipe) => {
    // Search in title
    const titleMatch = searchTerms.some((term) =>
      recipe.title.toLowerCase().includes(term)
    );

    // Search in description
    const descriptionMatch = searchTerms.some((term) =>
      recipe.description.toLowerCase().includes(term)
    );

    // Search in ingredients
    const ingredientMatch = searchTerms.some((term) =>
      recipe.ingredients.some((ingredient) =>
        ingredient.toLowerCase().includes(term)
      )
    );

    // Search in tags
    const tagMatch = recipe.tags
      ? searchTerms.some((term) =>
          recipe.tags?.some((tag) => tag.toLowerCase().includes(term))
        )
      : false;

    return titleMatch || descriptionMatch || ingredientMatch || tagMatch;
  });
};

/**
 * Get recipe by ID
 */
export const getRecipeById = (id: string): Recipe | undefined => {
  return recipeDatabase.find((recipe) => recipe.id === id);
};