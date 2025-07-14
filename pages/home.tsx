import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import RecipeCard from '@/components/recipe/RecipeCard';
import SuccessNotification from '@/components/common/SuccessNotification';
import { useAuth } from '@/hooks/useAuth';

export default function HomeMeal() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState('All');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const showSuccessNotification = React.useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  }, []);

  // Fetch recipes function
  const fetchRecipes = React.useCallback(async (mealType: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const mealTypeParam = mealType === 'All' ? 'all' : mealType.toLowerCase();
      const token = localStorage.getItem('authToken');
      
      // Add authorization header if user is logged in
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('mealType', mealTypeParam);
      queryParams.append('limit', '12');
      queryParams.append('personalized', user ? 'true' : 'false');
      
      const apiUrl = `/api/recipes?${queryParams.toString()}`;
      console.log('Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setRecipes(data.recipes || []);
      setIsPersonalized(data.personalized || false);
      console.log("Fetched recipes:", data.recipes, "Personalized:", data.personalized);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch recipes on component mount and when selected meal changes
  useEffect(() => {
    fetchRecipes(selectedMeal);
  }, [selectedMeal, fetchRecipes]);

  // Handle meal selection
  const handleMealSelect = (mealType: string) => {
    setSelectedMeal(mealType);
  };

  // Handle like toggle
  const handleLikeToggle = async (recipeId: string) => {
    if (!user) {
      showSuccessNotification('Please log in to like recipes');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      // Update the recipe in the recipes array
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, hasLiked: data.hasLiked, likesCount: data.likesCount }
            : recipe
        )
      );

      showSuccessNotification(data.hasLiked ? 'Recipe liked!' : 'Recipe unliked!');
    } catch (error) {
      console.error('Error toggling like:', error);
      showSuccessNotification('Failed to toggle like');
    }
  };

  // Handle save toggle
  const handleSaveToggle = async (recipeId: string) => {
    if (!user) {
      showSuccessNotification('Please log in to save recipes');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/recipes/${recipeId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle save');
      }

      const data = await response.json();
      
      // Update the recipe in the recipes array
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isSaved: data.isSaved }
            : recipe
        )
      );

      showSuccessNotification(data.isSaved ? 'Recipe saved!' : 'Recipe unsaved!');
    } catch (error) {
      console.error('Error toggling save:', error);
      showSuccessNotification('Failed to toggle save');
    }
  };

  return (
    <div className="min-h-screen w-full">
      <Head>
        <title>CookEase - Personalized Recipes</title>
        <meta name="description" content="Discover personalized recipes based on your preferences" />
      </Head>
      
      <Header />
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      
      {/* Main Content */}
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Hero Section */}
        <div className="w-full max-w-4xl text-center mb-8 mt-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-gray-800 mb-4">
            Welcome to{' '}
            <span className="text-primary">CookEase</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {isPersonalized && user ? 
              `Welcome back, ${user.name}! Here are your personalized recipe recommendations.` :
              'Discover delicious recipes tailored to your taste preferences and dietary needs.'
            }
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => router.push('/search')}
              className="w-full sm:w-auto bg-primary hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>Search Recipes</span>
            </button>
            
            <button
              onClick={() => router.push('/search?mode=ingredients')}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-full border-2 border-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>🧄</span>
              <span>Find by Ingredients</span>
            </button>
            
            <button
              onClick={() => router.push('/search?mode=discovery')}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-full border-2 border-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>✨</span>
              <span>Discover New</span>
            </button>
          </div>
        </div>

        {/* Meal Selection */}
        <div className="w-full max-w-6xl mb-8">
          <div className="flex justify-center gap-2 sm:gap-4">
            {['All', 'Breakfast', 'Lunch', 'Dinner'].map(meal => (
              <button
                key={meal}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full font-heading text-sm sm:text-base border-2 transition-colors ${
                  selectedMeal === meal 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-primary border-primary/30 hover:border-primary/50'
                }`}
                onClick={() => handleMealSelect(meal)}
              >
                {meal}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Section */}
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-800 mb-6 text-center">
            {selectedMeal === 'All' ? 'Featured Recipes' : `${selectedMeal} Recipes`}
            {isPersonalized && user && (
              <span className="text-sm font-normal text-primary block mt-1">
                ✨ Personalized for you
              </span>
            )}
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-800 mb-4">{error}</p>
                <button
                  onClick={() => fetchRecipes(selectedMeal)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-gray-600 mb-4">
                  No {selectedMeal === 'All' ? '' : selectedMeal.toLowerCase()} recipes found.
                </p>
                <button
                  onClick={() => setSelectedMeal('All')}
                  className="bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View All Recipes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                                 <RecipeCard
                   key={recipe.id}
                   id={recipe.id}
                   title={recipe.title}
                   image={recipe.image}
                   rating={recipe.rating}
                   cookTime={recipe.cookTime}
                   calories={recipe.calories}
                   cuisine={recipe.cuisine}
                   mealType={recipe.mealType}
                   difficulty={recipe.difficulty}
                 />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 