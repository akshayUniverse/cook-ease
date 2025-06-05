import { useState, useEffect } from "react";
import { getPersonalizedRecipes, searchRecipes, getRecipeById } from "@/utils/recipeEngine";
import { useAuth } from "./useAuth";

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

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPersonalizedRecipes = async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const personalizedRecipes = getPersonalizedRecipes(
        user?.preferences || {},
        limit
      );
      setRecipes(personalizedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const searchForRecipes = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = searchRecipes(query);
      setRecipes(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getRecipe = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const recipe = getRecipeById(id);
      return recipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSavedRecipes = useCallback(() => {
    if (!user) return [];
    
    // In a real implementation, this would fetch from an API
    // For now, we'll return mock data filtered by a hypothetical saved list
    const savedRecipeIds = ['1', '3']; // This would come from user.savedRecipes in a real app
    return getPersonalizedRecipes(user.preferences).filter(recipe => 
      savedRecipeIds.includes(recipe.id)
    );
  }, [user]);

  // Load personalized recipes on initial render if user is logged in
  useEffect(() => {
    if (user) {
      fetchPersonalizedRecipes();
    }
  }, [user]);

  return {
    recipes,
    loading,
    error,
    searchRecipes: handleSearch,
    getRecipeById: handleGetRecipeById,
    getSavedRecipes,
    fetchPersonalizedRecipes,
    searchForRecipes,
    getRecipe,
  };
};