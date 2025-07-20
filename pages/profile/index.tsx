import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useRouter } from 'next/router';

interface UserRecipe {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
    savedBy: number;
  };
}

interface UserStats {
  totalRecipes: number;
  totalLikes: number;
  totalSaves: number;
  averageRating: number;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recipes' | 'activity'>('recipes');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Fetch user's recipes
      const recipesResponse = await fetch(`/api/users/${user.id}/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (recipesResponse.ok) {
        const recipes = await recipesResponse.json();
        setUserRecipes(recipes);
        
        // Calculate stats
        const stats = {
          totalRecipes: recipes.length,
          totalLikes: recipes.reduce((sum: number, recipe: UserRecipe) => sum + recipe._count.likes, 0),
          totalSaves: recipes.reduce((sum: number, recipe: UserRecipe) => sum + recipe._count.savedBy, 0),
          averageRating: recipes.length > 0 ? recipes.reduce((sum: number, recipe: UserRecipe) => sum + recipe.rating, 0) / recipes.length : 0
        };
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Head>
          <title>Profile | CookEase</title>
          <meta name="description" content="Your CookEase profile" />
        </Head>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-heading text-gray-800 mb-2">Please log in</h2>
            <p className="text-gray-500 mb-6 text-center">You need to log in to view your profile</p>
            <Link 
              href="/auth" 
              className="px-6 py-3 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors font-heading"
            >
              Go to Login
            </Link>
          </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Profile | FoodToday</title>
        <meta name="description" content="Your FoodToday profile" />
      </Head>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-heading text-primary">{user.name[0]}</span>
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="font-heading text-2xl text-gray-800 mb-1">{user.name}</div>
              <div className="text-gray-500 text-sm mb-4">{user.email}</div>
              
              {/* User Stats */}
              {userStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{userStats.totalRecipes}</div>
                    <div className="text-sm text-gray-600">Recipes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">{userStats.totalLikes}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{userStats.totalSaves}</div>
                    <div className="text-sm text-gray-600">Saves</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500">{userStats.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              )}
              
              {/* Profile Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Link 
                  href="/library" 
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                  <div>
                    <div className="font-semibold text-blue-800">My Library</div>
                    <div className="text-sm text-blue-600">Saved recipes & favorites</div>
                  </div>
                </Link>

                <Link 
                  href="/preferences" 
                  className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
                  <div>
                    <div className="font-semibold text-green-800">Preferences</div>
                    <div className="text-sm text-green-600">Diet & cooking settings</div>
                  </div>
                </Link>

                <Link 
                  href="/recipe/add" 
                  className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                  <div>
                    <div className="font-semibold text-orange-800">Add Recipe</div>
                    <div className="text-sm text-orange-600">Share your creation</div>
                  </div>
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('recipes')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'recipes'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Recipes ({userRecipes.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'recipes' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading recipes...</p>
                  </div>
                ) : userRecipes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No recipes yet</p>
                    <Link 
                      href="/recipe/add" 
                      className="px-4 py-2 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
                    >
                      Create Your First Recipe
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userRecipes.map((recipe) => (
                      <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gray-200 relative">
                          <img
                            src={recipe.image || '/images/placeholder-recipe.svg'}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium">
                            ⭐ {recipe.rating.toFixed(1)}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 truncate">{recipe.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              <span>❤️ {recipe._count.likes}</span>
                              <span>💬 {recipe._count.comments}</span>
                              <span>📚 {recipe._count.savedBy}</span>
                            </div>
                            <button
                              onClick={() => router.push(`/recipe/${recipe.id}`)}
                              className="text-primary hover:text-orange-700 font-medium"
                            >
                              View →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Preferences</h3>
                
                {user.preferences?.dietaryRestrictions && user.preferences.dietaryRestrictions.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold text-gray-700 mb-2">Dietary Restrictions</div>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.dietaryRestrictions.map((restriction) => (
                        <span key={restriction} className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs font-semibold">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {user.preferences?.allergies && user.preferences.allergies.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold text-gray-700 mb-2">Allergies</div>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.allergies.map((allergy) => (
                        <span key={allergy} className="bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-semibold">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {user.preferences?.cuisinePreferences && user.preferences.cuisinePreferences.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold text-gray-700 mb-2">Favorite Cuisines</div>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.cuisinePreferences.map((cuisine) => (
                        <span key={cuisine} className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {user.preferences?.skillLevel && (
                  <div className="mb-4">
                    <div className="font-semibold text-gray-700 mb-2">Skill Level</div>
                    <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold">
                      {user.preferences.skillLevel}
                    </span>
                  </div>
                )}
                
                {(!user.preferences || Object.keys(user.preferences).length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No preferences set yet</p>
                    <Link 
                      href="/onboarding" 
                      className="px-4 py-2 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
                    >
                      Set Preferences
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <button 
            onClick={logout}
            className="bg-red-500 text-white rounded-full py-2 px-6 font-heading text-base shadow hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
}