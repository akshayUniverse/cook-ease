interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  fiber?: number;
  sodium?: number;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Get nutrition information for a single ingredient
 */
export const getIngredientNutrition = async (
  ingredient: Ingredient
): Promise<NutritionInfo> => {
  try {
    // In a real implementation, this would call an external API
    // For now, we'll return mock data
    return mockNutritionLookup(ingredient);
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    throw error;
  }
};

/**
 * Calculate nutrition for a full recipe
 */
export const calculateRecipeNutrition = async (
  ingredients: Ingredient[]
): Promise<NutritionInfo> => {
  try {
    // Get nutrition for each ingredient
    const nutritionPromises = ingredients.map(getIngredientNutrition);
    const nutritionData = await Promise.all(nutritionPromises);

    // Sum up the nutrition values
    const totalNutrition = nutritionData.reduce(
      (total, current) => {
        return {
          calories: total.calories + current.calories,
          protein: total.protein + current.protein,
          carbs: total.carbs + current.carbs,
          fat: total.fat + current.fat,
          sugar: (total.sugar || 0) + (current.sugar || 0),
          fiber: (total.fiber || 0) + (current.fiber || 0),
          sodium: (total.sodium || 0) + (current.sodium || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, sodium: 0 }
    );

    return totalNutrition;
  } catch (error) {
    console.error("Error calculating recipe nutrition:", error);
    throw error;
  }
};

/**
 * Mock function to simulate API lookup
 * In a real app, this would be replaced with actual API calls
 */
const mockNutritionLookup = (ingredient: Ingredient): NutritionInfo => {
  // This is a very simplified mock
  // In a real app, you would use a proper nutrition API
  const nutritionDatabase: Record<string, NutritionInfo> = {
    rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    beef: { calories: 250, protein: 26, carbs: 0, fat: 17 },
    tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
    onion: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
    potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
    carrot: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
    spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.2 },
    bread: { calories: 265, protein: 9.4, carbs: 49, fat: 3.2, fiber: 2.7 },
  };

  // Find the closest match in our database
  const ingredientKey = Object.keys(nutritionDatabase).find((key) =>
    ingredient.name.toLowerCase().includes(key)
  );

  if (!ingredientKey) {
    // Default values if ingredient not found
    return { calories: 50, protein: 2, carbs: 5, fat: 2 };
  }

  const baseNutrition = nutritionDatabase[ingredientKey];
  const scaleFactor = ingredient.quantity / 100; // Assuming database values are per 100g/ml

  // Scale nutrition values based on quantity
  return {
    calories: Math.round(baseNutrition.calories * scaleFactor),
    protein: parseFloat((baseNutrition.protein * scaleFactor).toFixed(1)),
    carbs: parseFloat((baseNutrition.carbs * scaleFactor).toFixed(1)),
    fat: parseFloat((baseNutrition.fat * scaleFactor).toFixed(1)),
    fiber: baseNutrition.fiber
      ? parseFloat((baseNutrition.fiber * scaleFactor).toFixed(1))
      : undefined,
    sugar: baseNutrition.sugar
      ? parseFloat((baseNutrition.sugar * scaleFactor).toFixed(1))
      : undefined,
    sodium: baseNutrition.sodium
      ? parseFloat((baseNutrition.sodium * scaleFactor).toFixed(1))
      : undefined,
  };
};