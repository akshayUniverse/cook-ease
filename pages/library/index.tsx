import React from "react";
import Head from "next/head";
import { useRecipes } from "@/hooks/useRecipes";
import { useAuth } from "@/hooks/useAuth";
import RecipeCard from "@/components/recipe/RecipeCard";
import SearchBar from "@/components/common/SearchBar";

export default function Library() {
  const { user } = useAuth();
  const { getSavedRecipes, loading } = useRecipes();
  const [savedRecipes, setSavedRecipes] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (user) {
      const recipes = getSavedRecipes();
      setSavedRecipes(recipes);
    }
  }, [user, getSavedRecipes]);

  const filteredRecipes = savedRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>My Library | CookEase</title>
        <meta name="description" content="Your saved recipes" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Library</h1>
        
        <div className="mb-6">
          <SearchBar 
            placeholder="Search your saved recipes" 
            onSearch={setSearchQuery} 
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Loading your recipes...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? "No matching recipes found" : "You haven't saved any recipes yet"}
            </p>
            {!searchQuery && (
              <a 
                href="/" 
                className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
              >
                Discover Recipes
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}