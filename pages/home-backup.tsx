import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import RecipeCard from '@/components/recipe/RecipeCard';
import SuccessNotification from '@/components/common/SuccessNotification';
import { useAuth } from '@/hooks/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function HomeMeal() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState('All');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [dailySuggestions, setDailySuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previouslySuggestedIds, setPreviouslySuggestedIds] = useState<string[]>([]);
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const router = useRouter();

  const showSuccessNotification = React.useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  }, []);

  // Load saved suggestions from localStorage on mount
  React.useEffect(() => {
    if (!user) return;
    
    try {
      const savedSuggestions = localStorage.getItem('dailySuggestions');
      if (savedSuggestions) {
        const suggestionData = JSON.parse(savedSuggestions);
        
        // Check if suggestions are still valid (same user, same day, within 6 hours)
        const now = Date.now();
        const isValid = suggestionData.userId === user.id && 
                       suggestionData.date === new Date().toDateString() &&
                       (now - suggestionData.timestamp) < 6 * 60 * 60 * 1000;
        
        if (isValid && suggestionData.recipes && suggestionData.recipes.length > 0) {
          console.log('📋 Loading saved suggestions from localStorage');
          setDailySuggestions(suggestionData.recipes);
          setShowSuggestions(true);
          setRecipes(suggestionData.recipes);
          setSelectedMeal('All');
        } else {
          // Clear expired or invalid suggestions
          localStorage.removeItem('dailySuggestions');
          console.log('🗑️ Cleared expired suggestions');
        }
      }
    } catch (error) {
      console.error('❌ Error loading saved suggestions:', error);
      localStorage.removeItem('dailySuggestions');
    }
  }, [user]);

  // Handle daily suggestions
  const handleGetSuggestions = React.useCallback(() => {
    requireAuth(async () => {
      // At this point user is guaranteed to exist due to requireAuth
      if (!user) return;

      // Check if user has ever set preferences
      const hasSetPreferences = localStorage.getItem(`preferences_set_${user.id}`);
      
      if (!hasSetPreferences) {
        // First-time user, redirect to preferences
        sessionStorage.setItem('redirect_after_preferences', 'true');
        showSuccessNotification('Welcome! Please set your food preferences first to get personalized suggestions!');
        setTimeout(() => {
          router.push('/preferences');
        }, 2000);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const headers: any = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Fetch 3 personalized recipes as suggestions (Easy, Medium, Hard)
        const excludeIds = previouslySuggestedIds.join(',');
        const apiUrl = `/api/recipes?limit=3&personalized=true&suggestions=true${excludeIds ? `&excludeIds=${excludeIds}` : ''}`;
        
        // Add cache busting to avoid stale results
        const cacheBuster = `&_t=${Date.now()}`;
        
        const response = await fetch(apiUrl + cacheBuster, {
          method: 'GET',
          headers: {
            ...headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const suggestions = data.recipes || [];
        
        console.log('📊 Suggestion breakdown:', data.difficulty_breakdown);
        
        // Store suggestions with timestamp
        const suggestionData = {
          recipes: suggestions,
          timestamp: Date.now(),
          date: new Date().toDateString(),
          userId: user.id
        };
        
        // Save to localStorage for 6 hours (6 * 60 * 60 * 1000 ms)
        localStorage.setItem('dailySuggestions', JSON.stringify(suggestionData));
        
        setDailySuggestions(suggestions);
        setShowSuggestions(true);
        setRecipes(suggestions);
        setSelectedMeal('All'); // Show all suggestions
        setLoading(false);
        
        // Track suggested recipe IDs to avoid repeating them
        const newSuggestedIds = suggestions.map((recipe: any) => recipe.id);
        setPreviouslySuggestedIds(prev => [...prev, ...newSuggestedIds]);
        
        showSuccessNotification(`✨ Got ${suggestions.length} personalized suggestions (Easy, Medium, Hard)!`);
        
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError('Failed to get suggestions. Please try again.');
        setLoading(false);
      }
    }, 'get personalized suggestions');
  }, [user, router, showSuccessNotification, requireAuth, previouslySuggestedIds]);

  // Auto-trigger suggestions after preferences are set for new users
  React.useEffect(() => {
    const shouldAutoTrigger = sessionStorage.getItem('auto_trigger_suggestions');
    if (shouldAutoTrigger && user) {
      sessionStorage.removeItem('auto_trigger_suggestions');
      
      // Small delay to ensure UI is ready
      setTimeout(() => {
        handleGetSuggestions();
      }, 1000);
    }
  }, [user, handleGetSuggestions]);

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

  // Don't fetch recipes automatically - only when user clicks "Get Today's Suggestions"
  // useEffect removed to prevent automatic recipe loading

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
        <title>FoodToday - Personalized Recipes</title>
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
            <span className="text-primary">FoodToday</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {isPersonalized && user ? 
              `Welcome back, ${user.name}! Here are your personalized recipe recommendations.` :
              user ? 
                'Click any button below to start discovering delicious recipes tailored to your taste!' :
                'Welcome to FoodToday! Click any action below to start exploring amazing recipes. Sign in for personalized recommendations!'
            }
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => requireAuth(() => router.push('/search'), 'search recipes')}
              className="w-full sm:w-auto bg-primary hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>Search Recipes</span>
            </button>
            
            <button
              onClick={() => requireAuth(() => router.push('/search?mode=ingredients'), 'search by ingredients')}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-full border-2 border-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>🧄</span>
              <span>Find by Ingredients</span>
            </button>
            
            <button
              onClick={() => requireAuth(() => router.push('/search?mode=discovery'), 'discover new recipes')}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-full border-2 border-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>✨</span>
              <span>Discover New</span>
            </button>
          </div>

          {/* Get Today's Suggestions Button - Separate from search buttons */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleGetSuggestions}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Getting Suggestions...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Get Today's Suggestions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Meal Selection - Only show when suggestions are displayed */}
        {showSuggestions && (
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
        )}

        {/* Recipes Section - Only show when suggestions are being loaded or available */}
        {(loading || showSuggestions) && (
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-800 mb-6 text-center">
              {user ? 
                (selectedMeal === 'All' ? 'Featured Recipes' : `${selectedMeal} Recipes`) :
                'Discover Amazing Recipes'
              }
              {isPersonalized && user && (
                <span className="text-sm font-normal text-primary block mt-1">
                  ✨ Personalized for you
                </span>
              )}
              {!user && (
                <span className="text-sm font-normal text-gray-500 block mt-1">
                  From cuisines around the world
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
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Ready to Start Cooking?
                </h3>
                <p className="text-gray-600 mb-6">
                  Click any action button above to discover amazing recipes from around the world!
                </p>
                <div className="text-sm text-gray-500">
                  🔍 Search recipes • 🧄 Find by ingredients • ✨ Get suggestions
                </div>
              </div>
            </div>
          ) : (
            <div className={`${
              showSuggestions && recipes.length === 3 
                ? "flex justify-center" 
                : ""
            }`}>
              <div className={`${
                showSuggestions && recipes.length === 3
                  ? "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              }`}>
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
            </div>
            {/* Show difficulty breakdown for suggestions */}
            {showSuggestions && recipes.length === 3 && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  🎯 <span className="font-medium">Easy • Medium • Hard</span> - Tailored to your preferences
                </p>
              </div>
            )}
                      )}
          </div>
        )}
        <BottomNav />
      </div>
    </div>
  );
} 