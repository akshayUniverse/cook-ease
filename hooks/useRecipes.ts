import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

interface Recipe {
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
  ingredients: any[];
  instructions: string[];
  tags: string[];
  rating: number;
  badge: string;
  author: {
    name: string;
    id: string;
  };
  _count: {
    likes: number;
    savedBy: number;
    comments: number;
  };
}

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecipes = async (params: {
    mealType?: string;
    cuisine?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      if (params.mealType) queryParams.append('mealType', params.mealType);
      if (params.cuisine) queryParams.append('cuisine', params.cuisine);
      if (params.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`/api/recipes?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const data = await response.json();
      setRecipes(data.recipes || []);
      return data.recipes || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedRecipes = async (limit: number = 10) => {
    // For now, fetch all recipes. In future, we can personalize based on user preferences
    return await fetchRecipes({ limit });
  };

  const searchForRecipes = async (query: string) => {
    return await fetchRecipes({ search: query });
  };

  const getRecipe = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) {
        throw new Error('Recipe not found');
      }
      
      const recipe = await response.json();
      return recipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSavedRecipes = useCallback(async () => {
    if (!user) return [];
    
    try {
      // In a real implementation, this would fetch user's saved recipes
      // For now, we'll return a subset of all recipes as "saved"
      const response = await fetch('/api/recipes?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch saved recipes');
      }
      
      const data = await response.json();
      return data.recipes || [];
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
      return [];
    }
  }, [user]);

  const saveRecipe = async (recipeId: string) => {
    if (!user) {
      throw new Error('User must be logged in to save recipes');
    }
    
    try {
      const response = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }
      
      return await response.json();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save recipe');
    }
  };

  const likeRecipe = async (recipeId: string) => {
    if (!user) {
      throw new Error('User must be logged in to like recipes');
    }
    
    try {
      const response = await fetch('/api/recipes/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to like recipe');
      }
      
      return await response.json();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to like recipe');
    }
  };

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
    fetchRecipes,
    getSavedRecipes,
    fetchPersonalizedRecipes,
    searchForRecipes,
    getRecipe,
    saveRecipe,
    likeRecipe,
  };
};