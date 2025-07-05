import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import SuccessNotification from '@/components/common/SuccessNotification';

const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner'];

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

export default function HomeMeal() {
  const [selectedMeal, setSelectedMeal] = useState(mealTypes[0]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const showSuccessNotification = React.useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  }, []);

  // Fetch recipes from API
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
      
      // Debug: Log the current URL and port
      console.log('Making API request to:', window.location.origin + `/api/recipes?mealType=${mealTypeParam}&limit=12&personalized=${user ? 'true' : 'false'}`);
      
      const response = await fetch(
        `/api/recipes?mealType=${mealTypeParam}&limit=12&personalized=${user ? 'true' : 'false'}`,
        { headers }
      );
      
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

  // Memoize the save button handler to prevent re-renders
  const handleSaveRecipe = React.useCallback(async (recipe: Recipe) => {
    if (!user) {
      alert('Please log in to save recipes');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Debug: Log the save API request
      console.log('Making save API request to:', window.location.origin + `/api/recipes/${recipe.id}/save`);
      
      const response = await fetch(`/api/recipes/${recipe.id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccessNotification('📚 Recipe saved to library!');
        // Refresh the page to update the count
        fetchRecipes(selectedMeal);
      } else {
        const errorData = await response.json();
        console.error('Save API error:', response.status, response.statusText, errorData);
        alert(errorData.error || 'Failed to save recipe');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      alert('Failed to save recipe');
    }
  }, [user, selectedMeal, showSuccessNotification, fetchRecipes]);

  // Load recipes when component mounts or meal type changes
  useEffect(() => {
    fetchRecipes(selectedMeal);
  }, [selectedMeal, fetchRecipes]);

  // Debug logging to check auth state
  React.useEffect(() => {
    console.log("Home page - Auth state:", { user, loading });
  }, [user, loading]);

  return (
    <div className="min-h-screen w-full">
      <Header />
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      
      {/* Main Content */}
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Personalization Indicator */}
        {user && isPersonalized && (
          <div className="w-full max-w-6xl mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-600">✨</span>
              <span className="text-sm font-medium text-green-800">
                Personalized recommendations based on your preferences
              </span>
              <button
                onClick={() => window.location.href = '/preferences'}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Preferences Setup Prompt for new users */}
        {user && !isPersonalized && (
          <div className="w-full max-w-6xl mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-blue-600">🎯</span>
              <span className="text-sm font-medium text-blue-800">
                Set your preferences for personalized recipes
              </span>
              <button
                onClick={() => window.location.href = '/preferences'}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
              >
                Set Preferences
              </button>
            </div>
          </div>
        )}
        
        {/* Meal Type Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {mealTypes.map(meal => (
            <button
              key={meal}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full font-heading text-sm sm:text-base border-2 transition-colors ${
                selectedMeal === meal 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-primary border-primary/30 hover:border-primary/50'
              }`}
              onClick={() => setSelectedMeal(meal)}
            >
              {meal}
            </button>
          ))}
        </div>
        
        {/* Recipe Cards Grid */}
        <div className="w-full max-w-6xl">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading delicious recipes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={() => fetchRecipes(selectedMeal)}
                  className="bg-primary text-white rounded-full px-4 py-2 hover:bg-orange-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-gray-500 mb-4">No recipes found for {selectedMeal}</p>
                <button 
                  onClick={() => setSelectedMeal('All')}
                  className="bg-primary text-white rounded-full px-4 py-2 hover:bg-orange-700 transition-colors"
                >
                  View All Recipes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {recipes.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6 flex flex-col items-center relative group">
                  {/* Recipe Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mb-3 sm:mb-4 border-3 border-gray-100 group-hover:border-primary/20 transition-colors">
                    <img 
                      src={recipe.image || '/images/placeholder-recipe.svg'} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  
                  {/* Recipe Name */}
                  <div className="font-heading font-semibold text-base sm:text-lg lg:text-xl text-gray-800 text-center mb-2 sm:mb-3">
                    {recipe.title}
                  </div>
                  
                  {/* Badge */}
                  <span 
                    className="text-xs sm:text-sm font-semibold rounded-full px-3 py-1 mb-3 sm:mb-4" 
                    style={{
                      background: recipe.badge.includes('Favorite') ? '#fde68a' : recipe.badge.includes('Skill') ? '#bae6fd' : '#fca5a5', 
                      color: '#b45309'
                    }}
                  >
                    {recipe.badge}
                  </span>
                  
                  {/* Nutrition Info */}
                  <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 text-center leading-relaxed">
                    🔥 {recipe.calories} Cal | 🧱 {recipe.protein}g Protein | 🧈 {recipe.fat}g Fat | 🍞 {recipe.carbs}g Carbs
                  </div>
                  
                  {/* Cook Time & Difficulty */}
                  <div className="text-xs text-gray-400 mb-3 text-center">
                    ⏱️ {recipe.cookTime} min • {recipe.difficulty} • ⭐ {recipe.rating.toFixed(1)}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => {
                        console.log('Navigating to recipe ID:', recipe.id);
                        window.location.href = `/recipe/${recipe.id}`;
                      }}
                      className="bg-primary text-white rounded-full px-4 py-2 text-sm font-heading shadow-md hover:bg-orange-700 hover:shadow-lg transition-all duration-200"
                    >
                      View Recipe
                    </button>
                    <button 
                      onClick={() => handleSaveRecipe(recipe)}
                      className="bg-gray-100 text-primary rounded-full px-4 py-2 text-sm font-heading shadow-md hover:bg-gray-200 hover:shadow-lg transition-all duration-200"
                    >
                      Save ({recipe._count.savedBy})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Load More Section (for future) */}
        <div className="mt-8 sm:mt-12">
          <button className="bg-white text-primary border-2 border-primary rounded-full px-6 py-3 font-heading text-base hover:bg-primary hover:text-white transition-all duration-200 shadow-md hover:shadow-lg">
            Load More Recipes
          </button>
        </div>
        
      </div>
    </div>
  );
} 