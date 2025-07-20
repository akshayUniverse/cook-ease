import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useTranslation } from '@/contexts/TranslationContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import RecipeCard from '@/components/recipe/RecipeCard';
import SuccessNotification from '@/components/common/SuccessNotification';

export default function HomeMeal() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState('All');
  const [dailySuggestions, setDailySuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [previouslySuggestedIds, setPreviouslySuggestedIds] = useState<string[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { t } = useTranslation();
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
          setDailySuggestions(suggestionData.recipes);
          setShowSuggestions(true);
          setRecipes(suggestionData.recipes);
          setSelectedMeal('All');
        } else {
          // Clear expired or invalid suggestions
          localStorage.removeItem('dailySuggestions');
        }
      }
    } catch (error) {
// console.error('❌ Error loading saved suggestions:', error);
      localStorage.removeItem('dailySuggestions');
    }
  }, [user]);

  // Handle daily suggestions with external API integration
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
        setError(null);

        const token = localStorage.getItem('authToken');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };

        // Fetch 3 personalized recipes as suggestions (Easy, Medium, Hard) WITH external API integration
        const excludeIds = previouslySuggestedIds.join(',');
        const apiUrl = `/api/recipes?limit=3&personalized=true&suggestions=true&includeExternal=true${excludeIds ? `&excludeIds=${excludeIds}` : ''}`;
        
        // Add cache busting to avoid stale results
        const cacheBuster = `&_t=${Date.now()}`;
        
        const response = await fetch(apiUrl + cacheBuster, {
          method: 'GET',
          headers: headers,
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

        showSuccessNotification(`✨ Got ${suggestions.length} personalized suggestions (Easy, Medium, Hard) from worldwide recipes!`);
        
      } catch (error) {
        console.error('❌ Error fetching suggestions:', error);
        setError(t('common.error', 'Something went wrong'));
        setLoading(false);
      }
    }, 'get personalized suggestions');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, showSuccessNotification, requireAuth]); // Removed previouslySuggestedIds to prevent infinite loop

  // Auto-trigger suggestions after preferences are set for new users
  React.useEffect(() => {
    const shouldAutoTrigger = sessionStorage.getItem('auto_trigger_suggestions');
    if (shouldAutoTrigger && user && !dailySuggestions.length) {
      sessionStorage.removeItem('auto_trigger_suggestions');
      
      // Small delay to ensure UI is ready
      setTimeout(() => {
        handleGetSuggestions();
      }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dailySuggestions.length]); // Only trigger if no suggestions exist

  // Fetch recipes function with external API integration
  const fetchRecipes = React.useCallback(async (mealType: string) => {
    if (!user) {
      // Show empty state for non-logged users
      setRecipes([]);
      setIsPersonalized(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsPersonalized(true);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/recipes?mealType=${mealType}&limit=12&personalized=true&includeExternal=true&_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      // console.error('Error fetching recipes:', error);
      setError('Failed to load recipes. Please try again.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleMealSelect = (mealType: string) => {
    setSelectedMeal(mealType);
    if (!showSuggestions) {
      fetchRecipes(mealType);
    } else {
      // Filter suggestions by meal type
      if (mealType === 'All') {
        setRecipes(dailySuggestions);
      } else {
        const filteredSuggestions = dailySuggestions.filter(recipe => 
          recipe.mealType?.toLowerCase() === mealType.toLowerCase()
        );
        setRecipes(filteredSuggestions);
      }
    }
  };

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
            ? { ...recipe, isLiked: data.isLiked }
            : recipe
        )
      );

      showSuccessNotification(data.isLiked ? 'Recipe liked!' : 'Recipe unliked!');
    } catch (error) {
      // console.error('Error toggling like:', error);
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
      // console.error('Error toggling save:', error);
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

      <div className="flex flex-col items-center justify-start min-h-screen pt-8 px-4 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        
        {/* Hero Section */}
        <div className="text-center mb-8 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-gray-800 mb-4 leading-tight">
            {user ? (
              <>
                Welcome back, <span className="text-primary">{user.name || 'Chef'}!</span>
                <br />
                <span className="text-2xl sm:text-3xl lg:text-4xl">What would you like to cook today?</span>
              </>
            ) : (
              <>
                Discover Amazing <span className="text-primary">Recipes</span>
                <br />
                <span className="text-2xl sm:text-3xl lg:text-4xl">From Cuisines Around the World</span>
              </>
            )}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            {user ? 
              'Get personalized suggestions based on your preferences and dietary needs' :
              'Explore thousands of recipes from every corner of the globe. Login for personalized recommendations!'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => requireAuth(() => router.push('/search'), 'search for recipes')}
            className="bg-white hover:bg-gray-50 text-primary font-bold py-3 px-8 rounded-full border-2 border-primary hover:border-primary/70 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[200px]"
          >
            <span>🔍</span>
            <span>Search Recipes</span>
          </button>
          <button
            onClick={() => requireAuth(() => router.push('/search?tab=ingredients'), 'search by ingredients')}
            className="bg-white hover:bg-gray-50 text-primary font-bold py-3 px-8 rounded-full border-2 border-primary hover:border-primary/70 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[200px]"
          >
            <span>🧄</span>
            <span>Find by Ingredients</span>
          </button>
          <button
            onClick={() => requireAuth(() => router.push('/search?trending=true'), 'discover trending recipes')}
            className="bg-white hover:bg-gray-50 text-primary font-bold py-3 px-8 rounded-full border-2 border-primary hover:border-primary/70 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[200px]"
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
                <span>{t('home.todaySuggestions', 'Get Today\'s Suggestions')} (Worldwide)</span>
              </>
            )}
          </button>
        </div>

        {/* Meal Selection - Only show when suggestions are displayed */}
        {showSuggestions && (
          <div className="w-full max-w-6xl mb-8">
            <div className="flex justify-center gap-2 sm:gap-4">
              {[
                { key: 'All', translationKey: 'home.meal.all' },
                { key: 'Breakfast', translationKey: 'home.meal.breakfast' },
                { key: 'Lunch', translationKey: 'home.meal.lunch' },
                { key: 'Dinner', translationKey: 'home.meal.dinner' }
              ].map(meal => (
                <button
                  key={meal.key}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full font-heading text-sm sm:text-base border-2 transition-colors ${
                    selectedMeal === meal.key 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-primary border-primary/30 hover:border-primary/50'
                  }`}
                  onClick={() => handleMealSelect(meal.key)}
                >
                  {t(meal.translationKey, meal.key)}
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
                  ✨ Personalized for you from worldwide sources
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
            )}
            
            {/* Show difficulty breakdown for suggestions */}
            {showSuggestions && recipes.length === 3 && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  🎯 <span className="font-medium">Easy • Medium • Hard</span> - Tailored to your preferences from worldwide recipes
                </p>
              </div>
            )}
          </div>
        )}
        
        <BottomNav />
      </div>
    </div>
  );
} 