import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/hooks/useAuth';
import SuccessNotification from '@/components/common/SuccessNotification';
import AdvancedSearch, { SearchFilters } from '@/components/common/AdvancedSearch';
import IngredientSearch from '@/components/common/IngredientSearch';
import SearchHistory from '@/components/common/SearchHistory';
import RecipeDiscovery from '@/components/common/RecipeDiscovery';

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLibraryMode, setIsLibraryMode] = useState(false);
  const isInitialMount = React.useRef(true);
  
  // Search modes
  const [searchMode, setSearchMode] = useState<'general' | 'ingredients' | 'discovery'>('general');
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [currentSearchFilters, setCurrentSearchFilters] = useState<SearchFilters | null>(null);
  const [hasAdvancedFilters, setHasAdvancedFilters] = useState(false);
  
  // Single input state for all search functionality
  const [searchInput, setSearchInput] = useState('');
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    cuisine: 'all',
    mealType: 'all',
    difficulty: 'all',
    ingredients: '',
    tags: '',
    caloriesMin: undefined,
    caloriesMax: undefined,
    proteinMin: undefined,
    proteinMax: undefined,
    carbsMin: undefined,
    carbsMax: undefined,
    fatMin: undefined,
    fatMax: undefined,
    cookTimeMin: undefined,
    cookTimeMax: undefined,
    sortBy: 'newest'
  });

  const showSuccessNotification = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  }, []);

  // Initialize everything from URL params when router becomes ready
  useEffect(() => {
    if (router.isReady && isInitialMount.current) {
      const { q, cuisine, mealType, difficulty, ingredients, mode } = router.query;
      
      // Set search mode
      if (mode === 'ingredients') {
        setSearchMode('ingredients');
      } else if (mode === 'discovery') {
        setSearchMode('discovery');
      } else {
        setSearchMode('general');
      }
      
      // Set main search input
      if (q) {
        setSearchInput(q as string);
      }
      
      // Set filter states
      if (q || cuisine || mealType || difficulty || ingredients) {
        const newFilters = {
          ...filters,
          search: (q as string) || '',
          cuisine: (cuisine as string) || 'all',
          mealType: (mealType as string) || 'all',
          difficulty: (difficulty as string) || 'all',
          ingredients: (ingredients as string) || ''
        };
        setFilters(newFilters);
        setCurrentSearchFilters(newFilters);
      }
      
      // Mark initialization complete
      isInitialMount.current = false;
      
      // Trigger initial search after setup
      setTimeout(performSearch, 200);
    }
  }, [router.isReady]);

  const performSearch = useCallback(async () => {
    if (searchMode === 'discovery') {
      return; // Discovery mode doesn't need API search
    }
    
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

      let response;
      
      if (isLibraryMode) {
        // Search within saved recipes
        if (!token) {
          throw new Error('Please log in to search your library');
        }
        
        response = await fetch('/api/recipes/saved', {
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch saved recipes');
        }
        
        const savedRecipes = await response.json();
        
        // Filter saved recipes based on search criteria
        let filteredRecipes = savedRecipes;
        
        if (filters.search) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            recipe.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            recipe.cuisine.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        
        if (filters.cuisine && filters.cuisine !== 'all') {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())
          );
        }
        
        if (filters.mealType && filters.mealType !== 'all') {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.mealType.toLowerCase().includes(filters.mealType.toLowerCase())
          );
        }
        
        if (filters.difficulty && filters.difficulty !== 'all') {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
          );
        }
        
        if (filters.cookTimeMax !== undefined) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            (recipe.cookTime || 30) <= filters.cookTimeMax!
          );
        }
        
        if (filters.caloriesMax !== undefined) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            (recipe.calories || 0) <= filters.caloriesMax!
          );
        }
        
        setRecipes(filteredRecipes);
        setTotalCount(filteredRecipes.length);
        
      } else {
        // Search all recipes - use the enhanced API
        const queryParams = new URLSearchParams();
        
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.cuisine && filters.cuisine !== 'all') queryParams.append('cuisine', filters.cuisine);
        if (filters.mealType && filters.mealType !== 'all') queryParams.append('mealType', filters.mealType);
        if (filters.difficulty && filters.difficulty !== 'all') queryParams.append('difficulty', filters.difficulty);
        if (filters.ingredients) queryParams.append('ingredients', filters.ingredients);
        if (filters.tags) queryParams.append('tags', filters.tags);
        
        // Add advanced nutrition filters
        if (filters.caloriesMin !== undefined) queryParams.append('caloriesMin', filters.caloriesMin.toString());
        if (filters.caloriesMax !== undefined) queryParams.append('caloriesMax', filters.caloriesMax.toString());
        if (filters.proteinMin !== undefined) queryParams.append('proteinMin', filters.proteinMin.toString());
        if (filters.proteinMax !== undefined) queryParams.append('proteinMax', filters.proteinMax.toString());
        if (filters.carbsMin !== undefined) queryParams.append('carbsMin', filters.carbsMin.toString());
        if (filters.carbsMax !== undefined) queryParams.append('carbsMax', filters.carbsMax.toString());
        if (filters.fatMin !== undefined) queryParams.append('fatMin', filters.fatMin.toString());
        if (filters.fatMax !== undefined) queryParams.append('fatMax', filters.fatMax.toString());
        if (filters.cookTimeMin !== undefined) queryParams.append('cookTimeMin', filters.cookTimeMin.toString());
        if (filters.cookTimeMax !== undefined) queryParams.append('cookTimeMax', filters.cookTimeMax.toString());
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        
        queryParams.append('limit', '24');
        queryParams.append('personalized', user ? 'true' : 'false');
        
        const apiUrl = `/api/recipes?${queryParams.toString()}`;
        console.log('Making search request to:', apiUrl);
        
        response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to search recipes');
        }
        
        const data = await response.json();
        setRecipes(data.recipes || []);
        setTotalCount(data.totalCount || 0);
        setHasAdvancedFilters(data.hasAdvancedFilters || false);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [filters, isLibraryMode, searchMode, user]);

  // Handle input changes with debounced search
  useEffect(() => {
    if (!isInitialMount.current && searchInput !== undefined) {
      const timeoutId = setTimeout(() => {
        // Update filters
        setFilters(prev => ({
          ...prev,
          search: searchInput,
          ingredients: searchMode === 'ingredients' ? searchInput : prev.ingredients
        }));
        
        // Update URL
        const urlParams = new URLSearchParams();
        if (searchInput) urlParams.append('q', searchInput);
        if (searchMode !== 'general') urlParams.append('mode', searchMode);
        
        const newUrl = urlParams.toString() ? `/search?${urlParams.toString()}` : '/search';
        router.replace(newUrl, undefined, { shallow: true });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchInput, searchMode, router]);

  // Handle filter changes - trigger search immediately
  useEffect(() => {
    if (!isInitialMount.current) {
      const timeoutId = setTimeout(performSearch, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.cuisine, filters.mealType, filters.difficulty, filters.tags, filters.caloriesMin, filters.caloriesMax, filters.proteinMin, filters.proteinMax, filters.carbsMin, filters.carbsMax, filters.fatMin, filters.fatMax, filters.cookTimeMin, filters.cookTimeMax, filters.sortBy]);

  // Handle library mode changes
  useEffect(() => {
    if (!isInitialMount.current) {
      const timeoutId = setTimeout(performSearch, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isLibraryMode]);

  // Handle search changes
  useEffect(() => {
    if (!isInitialMount.current) {
      const timeoutId = setTimeout(performSearch, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  // Handle advanced search
  const handleAdvancedSearch = (advancedFilters: SearchFilters) => {
    setCurrentSearchFilters(advancedFilters);
    setFilters(advancedFilters);
    setSearchMode('general');
    setShowSearchHistory(false);
    
    // Update URL
    const urlParams = new URLSearchParams();
    if (advancedFilters.search) urlParams.append('q', advancedFilters.search);
    if (advancedFilters.cuisine && advancedFilters.cuisine !== 'all') urlParams.append('cuisine', advancedFilters.cuisine);
    if (advancedFilters.mealType && advancedFilters.mealType !== 'all') urlParams.append('mealType', advancedFilters.mealType);
    if (advancedFilters.difficulty && advancedFilters.difficulty !== 'all') urlParams.append('difficulty', advancedFilters.difficulty);
    if (advancedFilters.ingredients) urlParams.append('ingredients', advancedFilters.ingredients);
    
    const newUrl = urlParams.toString() ? `/search?${urlParams.toString()}` : '/search';
    router.replace(newUrl, undefined, { shallow: true });
  };

  // Handle ingredient search
  const handleIngredientSearch = (ingredients: string[]) => {
    const ingredientString = ingredients.join(',');
    const newFilters = {
      ...filters,
      ingredients: ingredientString,
      search: `Recipes with: ${ingredients.join(', ')}`
    };
    
    setCurrentSearchFilters(newFilters);
    setFilters(newFilters);
    setSearchInput(newFilters.search);
    setSearchMode('ingredients');
    
    // Update URL
    const urlParams = new URLSearchParams();
    urlParams.append('ingredients', ingredientString);
    urlParams.append('mode', 'ingredients');
    
    router.replace(`/search?${urlParams.toString()}`, undefined, { shallow: true });
  };

  // Handle search history apply
  const handleApplySearchHistory = (historyFilters: SearchFilters) => {
    setCurrentSearchFilters(historyFilters);
    setFilters(historyFilters);
    setSearchInput(historyFilters.search || '');
    setSearchMode('general');
    setShowSearchHistory(false);
    
    // Update URL
    const urlParams = new URLSearchParams();
    if (historyFilters.search) urlParams.append('q', historyFilters.search);
    if (historyFilters.cuisine && historyFilters.cuisine !== 'all') urlParams.append('cuisine', historyFilters.cuisine);
    if (historyFilters.mealType && historyFilters.mealType !== 'all') urlParams.append('mealType', historyFilters.mealType);
    if (historyFilters.difficulty && historyFilters.difficulty !== 'all') urlParams.append('difficulty', historyFilters.difficulty);
    if (historyFilters.ingredients) urlParams.append('ingredients', historyFilters.ingredients);
    
    const newUrl = urlParams.toString() ? `/search?${urlParams.toString()}` : '/search';
    router.replace(newUrl, undefined, { shallow: true });
  };

  // Reset search filters
  const handleResetSearch = () => {
    setCurrentSearchFilters(null);
    setHasAdvancedFilters(false);
    setFilters({
      search: '',
      cuisine: 'all',
      mealType: 'all',
      difficulty: 'all',
      ingredients: '',
      tags: '',
      caloriesMin: undefined,
      caloriesMax: undefined,
      proteinMin: undefined,
      proteinMax: undefined,
      carbsMin: undefined,
      carbsMax: undefined,
      fatMin: undefined,
      fatMax: undefined,
      cookTimeMin: undefined,
      cookTimeMax: undefined,
      sortBy: 'newest'
    });
    setSearchInput('');
    setSearchMode('general');
    router.replace('/search', undefined, { shallow: true });
  };

  // Handle ingredient search reset
  const handleIngredientReset = () => {
    setFilters(prev => ({
      ...prev,
      ingredients: '',
      search: ''
    }));
    setSearchInput('');
    setRecipes([]);
    setCurrentSearchFilters(null);
    setSearchMode('general');
    router.replace('/search', undefined, { shallow: true });
  };

  // Handle recipe click from discovery
  const handleRecipeClick = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
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
    <>
      <Head>
        <title>Search Recipes | CookEase</title>
        <meta name="description" content="Search and filter recipes by ingredients, cuisine, difficulty, and more" />
      </Head>
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SuccessNotification
          message={successMessage}
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
        
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchMode === 'ingredients' ? 'Find Recipes by Ingredients' : 
             searchMode === 'discovery' ? 'Discover New Recipes' :
             isLibraryMode ? 'Search My Saved Recipes' : 'Find Your Perfect Recipe'}
          </h1>
          <p className="text-gray-600">
            {searchMode === 'ingredients' ? 'Search by what ingredients you have available' :
             searchMode === 'discovery' ? 'Explore trending, popular, and personalized recipe recommendations' :
             isLibraryMode ? 'Search and filter through your saved recipes' : 
             'Search by recipe name, ingredients, cuisine, cooking time, nutrition, and more'}
          </p>
        </div>

        {/* Search Mode Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <button
              onClick={() => setSearchMode('general')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchMode === 'general'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔍 General Search
            </button>
            <button
              onClick={() => setSearchMode('ingredients')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchMode === 'ingredients'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🧄 Ingredients
            </button>
            <button
              onClick={() => setSearchMode('discovery')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchMode === 'discovery'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✨ Discovery
            </button>
          </div>
        </div>

        {/* Search Content based on mode */}
        {searchMode === 'general' && (
          <>
            {/* Main Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search recipes, ingredients, cuisine, or cooking style..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Search Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Advanced Search */}
              <div className="lg:col-span-2">
                <AdvancedSearch
                  onSearch={handleAdvancedSearch}
                  onReset={handleResetSearch}
                  isOpen={isAdvancedSearchOpen}
                  onToggle={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                />
              </div>
              
              {/* Search History */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <button
                    onClick={() => setShowSearchHistory(!showSearchHistory)}
                    className="w-full mb-4 lg:hidden flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span>🕐</span>
                    <span>Search History</span>
                  </button>
                  
                  <div className={`${showSearchHistory ? 'block' : 'hidden'} lg:block`}>
                    <SearchHistory
                      onApplySearch={handleApplySearchHistory}
                      currentFilters={currentSearchFilters || undefined}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Library Mode Toggle */}
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setIsLibraryMode(!isLibraryMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLibraryMode 
                    ? 'bg-primary text-white hover:bg-orange-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{isLibraryMode ? '✓ My Library' : 'My Library'}</span>
              </button>
              
              <div className="text-sm text-gray-500">
                {loading ? 'Searching...' : `${totalCount} recipe${totalCount !== 1 ? 's' : ''} found`}
              </div>
            </div>
          </>
        )}

        {searchMode === 'ingredients' && (
          <div className="mb-6">
            <IngredientSearch
              onSearch={handleIngredientSearch}
              onReset={handleIngredientReset}
            />
          </div>
        )}

        {searchMode === 'discovery' && (
          <div className="mb-6">
            <RecipeDiscovery onRecipeClick={handleRecipeClick} />
          </div>
        )}

        {/* Search Results */}
        {searchMode !== 'discovery' && (
          <>
            {/* Search Results Indicator */}
            {(hasAdvancedFilters || currentSearchFilters) && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-medium">🔍 Active Search Filters</span>
                    {currentSearchFilters?.search && (
                      <span className="text-sm text-gray-600">
                        Query: "{currentSearchFilters.search}"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleResetSearch}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Searching recipes...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">❌ {error}</div>
                <button
                  onClick={performSearch}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && !error && (
              <>
                {recipes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">🔍 No recipes found</div>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or browse our recipe discovery section
                    </p>
                    <button
                      onClick={() => setSearchMode('discovery')}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Discover Recipes
                    </button>
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
              </>
            )}
          </>
        )}
      </div>
    </>
  );
} 