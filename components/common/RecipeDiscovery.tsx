import React, { useState, useEffect } from 'react';
import { FireIcon, StarIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

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

interface RecipeDiscoveryProps {
  onRecipeClick: (recipeId: string) => void;
}

const RecipeDiscovery: React.FC<RecipeDiscoveryProps> = ({ onRecipeClick }) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'personalized'>('trending');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch recipes based on discovery type
  const fetchDiscoveryRecipes = async (type: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let queryParams = new URLSearchParams();
      queryParams.append('limit', '8');
      
      switch (type) {
        case 'trending':
          // Sort by recent activity (likes + comments + saves)
          queryParams.append('sortBy', 'newest');
          queryParams.append('personalized', 'false');
          break;
        case 'popular':
          // Sort by rating/popularity
          queryParams.append('sortBy', 'rating');
          queryParams.append('personalized', 'false');
          break;
        case 'personalized':
          queryParams.append('personalized', user ? 'true' : 'false');
          queryParams.append('sortBy', 'newest');
          break;
      }
      
      const response = await fetch(`/api/recipes?${queryParams.toString()}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Load recipes when tab changes
  useEffect(() => {
    fetchDiscoveryRecipes(activeTab);
  }, [activeTab, user]);

  // Calculate trend score based on activity
  const getTrendScore = (recipe: Recipe): number => {
    // Since we don't have createdAt, use activity score directly
    const activityScore = (recipe._count.likes * 2) + (recipe._count.comments * 3) + (recipe._count.savedBy * 1);
    return Math.floor(activityScore);
  };

  // Get discovery type details
  const getDiscoveryDetails = (type: string) => {
    switch (type) {
      case 'trending':
        return {
          icon: <FireIcon className="h-5 w-5" />,
          title: 'Trending',
          description: 'Hot recipes everyone is talking about',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'popular':
        return {
          icon: <StarIcon className="h-5 w-5" />,
          title: 'Popular',
          description: 'Highest rated recipes of all time',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'personalized':
        return {
          icon: <SparklesIcon className="h-5 w-5" />,
          title: 'For You',
          description: user ? 'Personalized based on your preferences' : 'Sign in for personalized recommendations',
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: <FireIcon className="h-5 w-5" />,
          title: 'Recipes',
          description: 'Discover new recipes',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const currentDetails = getDiscoveryDetails(activeTab);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recipe Discovery</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>Updated daily</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {(['trending', 'popular', 'personalized'] as const).map((tab) => {
          const details = getDiscoveryDetails(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? `${details.bgColor} ${details.color} border ${details.borderColor}`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {details.icon}
              <span className="font-medium">{details.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      <div className={`mb-6 p-4 rounded-lg ${currentDetails.bgColor} ${currentDetails.borderColor} border`}>
        <div className="flex items-center space-x-2">
          <span className={currentDetails.color}>{currentDetails.icon}</span>
          <h3 className="font-medium text-gray-900">{currentDetails.title}</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">{currentDetails.description}</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading recipes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchDiscoveryRecipes(activeTab)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No recipes found</p>
          <p className="text-sm text-gray-400">Check back later for updates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onRecipeClick(recipe.id)}
            >
              {/* Recipe Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={recipe.image || '/images/placeholder-recipe.svg'}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Recipe Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">{recipe.title}</h4>
                  {activeTab === 'trending' && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  )}
                  {activeTab === 'popular' && (
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">{recipe.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 truncate mb-2">{recipe.description}</p>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>⏱️ {recipe.cookTime}min</span>
                  <span>👨‍🍳 {recipe.author.name}</span>
                  <span>❤️ {recipe._count.likes}</span>
                  {activeTab === 'trending' && (
                    <span className="text-red-500">🔥 {getTrendScore(recipe)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View More Button */}
      {recipes.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              // Navigate to full discovery page with current tab
              window.location.href = `/discovery?tab=${activeTab}`;
            }}
            className="text-primary hover:text-orange-700 text-sm font-medium"
          >
            View More {currentDetails.title} Recipes →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeDiscovery; 