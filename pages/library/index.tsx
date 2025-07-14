import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import RecipeCard from "@/components/recipe/RecipeCard";
import Header from '@/components/layout/Header';

export default function Library() {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      const loadSavedRecipes = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const token = localStorage.getItem('authToken');
          if (!token) return;

          const response = await fetch('/api/recipes/saved', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const recipes = await response.json();
      setSavedRecipes(recipes);
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to fetch saved recipes');
    }
        } catch (err) {
          setError('Failed to fetch saved recipes');
        } finally {
          setLoading(false);
        }
      };
      loadSavedRecipes();
    } else {
      setLoading(false);
    }
  }, [user]);



  return (
    <>
      <Head>
        <title>My Library | CookEase</title>
        <meta name="description" content="Your saved recipes" />
      </Head>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Library</h1>

          {!user ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500 mb-4">Please log in to view your saved recipes</p>
              <Link 
                href="/auth" 
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
              >
                Log In
              </Link>
          </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your recipes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {savedRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  id={recipe.id}
                  title={recipe.title}
                  image={recipe.image}
                  rating={recipe.rating || 0}
                  cookTime={recipe.cookTime || 30}
                  calories={recipe.calories || 0}
                  cuisine={recipe.cuisine}
                  mealType={recipe.mealType}
                  difficulty={recipe.difficulty}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500 mb-4">You haven't saved any recipes yet</p>
              <Link 
                href="/home" 
                  className="px-4 py-2 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
                >
                  Discover Recipes
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}