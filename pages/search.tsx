import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/hooks/useAuth';
import SuccessNotification from '@/components/common/SuccessNotification';

interface SearchFilters {
  query: string;
  cuisine: string;
  mealType: string;
  difficulty: string;
  maxCookTime: number;
  minRating: number;
  maxCalories: number;
  ingredients: string;
  tags: string[];
}

const cuisineOptions = [
  { value: '', label: 'All Cuisines' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'indian', label: 'Indian' },
  { value: 'american', label: 'American' },
  { value: 'french', label: 'French' },
  { value: 'thai', label: 'Thai' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'korean', label: 'Korean' }
];

const mealTypeOptions = [
  { value: '', label: 'All Meals' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' }
];

const difficultyOptions = [
  { value: '', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

const popularTags = [
  'quick', 'healthy', 'vegetarian', 'vegan', 'gluten-free', 
  'dairy-free', 'low-carb', 'high-protein', 'kid-friendly', 
  'one-pot', 'meal-prep', 'comfort-food'
];

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLibraryMode, setIsLibraryMode] = useState(false);
  const isInitialMount = React.useRef(true);
  
  // Single input state for all search functionality
  const [searchInput, setSearchInput] = useState('');
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    cuisine: '',
    mealType: '',
    difficulty: '',
    maxCookTime: 120,
    minRating: 0,
    maxCalories: 2000,
    ingredients: '',
    tags: []
  });

  const showSuccessNotification = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  }, []);

  // Initialize everything from URL params when router becomes ready
  useEffect(() => {
    if (router.isReady && isInitialMount.current) {
      const { q, cuisine, mealType, difficulty, ingredients } = router.query;
      
      // Set main search input (handles both general search and ingredients)
      if (q) {
        setSearchInput(q as string);
      }
      
      // Set filter states
      if (q || cuisine || mealType || difficulty || ingredients) {
        const newFilters = {
          ...filters,
          query: (q as string) || '',
          cuisine: (cuisine as string) || '',
          mealType: (mealType as string) || '',
          difficulty: (difficulty as string) || '',
          ingredients: (ingredients as string) || ''
        };
        setFilters(newFilters);
      }
      
      // Mark initialization complete
      isInitialMount.current = false;
      
      // Trigger initial search after setup
      setTimeout(performSearch, 200);
    }
  }, [router.isReady]); // Only run when router becomes ready

  const performSearch = useCallback(async () => {
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
        
        if (filters.query) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.title.toLowerCase().includes(filters.query.toLowerCase()) ||
            recipe.description.toLowerCase().includes(filters.query.toLowerCase()) ||
            recipe.cuisine.toLowerCase().includes(filters.query.toLowerCase())
          );
        }
        
        if (filters.cuisine) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())
          );
        }
        
        if (filters.mealType) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.mealType.toLowerCase().includes(filters.mealType.toLowerCase())
          );
        }
        
        if (filters.difficulty) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            recipe.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
          );
        }
        
        if (filters.maxCookTime < 120) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            (recipe.cookTime || 30) <= filters.maxCookTime
          );
        }
        
        if (filters.minRating > 0) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            (recipe.rating || 0) >= filters.minRating
          );
        }
        
        if (filters.maxCalories < 2000) {
          filteredRecipes = filteredRecipes.filter((recipe: any) =>
            (recipe.calories || 0) <= filters.maxCalories
          );
        }
        
        setRecipes(filteredRecipes);
        setTotalCount(filteredRecipes.length);
        
      } else {
        // Search all recipes
        const queryParams = new URLSearchParams();
        
        if (filters.query) queryParams.append('search', filters.query);
        if (filters.cuisine) queryParams.append('cuisine', filters.cuisine);
        if (filters.mealType) queryParams.append('mealType', filters.mealType);
        if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
        if (filters.maxCookTime < 120) queryParams.append('maxCookTime', filters.maxCookTime.toString());
        if (filters.minRating > 0) queryParams.append('minRating', filters.minRating.toString());
        if (filters.maxCalories < 2000) queryParams.append('maxCalories', filters.maxCalories.toString());
        if (filters.ingredients) queryParams.append('ingredients', filters.ingredients);
        if (filters.tags.length > 0) queryParams.append('tags', filters.tags.join(','));
        
        queryParams.append('limit', '24');
        
        response = await fetch(`/api/recipes/search?${queryParams.toString()}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to search recipes');
        }
        
        const data = await response.json();
        setRecipes(data.recipes || []);
        setTotalCount(data.totalCount || 0);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [filters, isLibraryMode]);

  // Trigger search when URL params change (after initialization)
  useEffect(() => {
    if (!isInitialMount.current) {
      const hasInitialParams = Object.values(router.query).some(value => value);
      if (hasInitialParams) {
        setTimeout(performSearch, 100);
      }
    }
  }, [router.query, performSearch]);

  // Handle input changes with debounced search
  useEffect(() => {
    if (!isInitialMount.current && searchInput !== undefined) {
      const timeoutId = setTimeout(() => {
        // Update filters - main search handles both general search and ingredients
        setFilters(prev => ({
          ...prev,
          query: searchInput,
          ingredients: searchInput // Use same input for ingredients search
        }));
        
        // Update URL
        const urlParams = new URLSearchParams();
        if (searchInput) urlParams.append('q', searchInput);
        
        const newUrl = urlParams.toString() ? `/search?${urlParams.toString()}` : '/search';
        router.replace(newUrl, undefined, { shallow: true });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchInput]);

  // Handle filter changes (dropdowns, sliders, etc.) - trigger search immediately
  useEffect(() => {
    if (!isInitialMount.current) {
      const timeoutId = setTimeout(performSearch, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.cuisine, filters.mealType, filters.difficulty, filters.maxCookTime, filters.minRating, filters.maxCalories, filters.tags]);

  // Handle library mode changes - trigger search immediately
  useEffect(() => {
    if (!isInitialMount.current) {
      const timeoutId = setTimeout(performSearch, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isLibraryMode]);

  // Handle search query changes - trigger search when query changes
  useEffect(() => {
    if (!isInitialMount.current) {
      const timeoutId = setTimeout(performSearch, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.query]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = useCallback(() => {
    // Keep search input intact, only clear filters
    // Update filters to keep the search query but reset other filters
    setFilters(prev => ({
      ...prev,
      cuisine: '',
      mealType: '',
      difficulty: '',
      maxCookTime: 120,
      minRating: 0,
      maxCalories: 2000,
      ingredients: '',
      tags: []
    }));
    
    // Don't reset library mode - let user keep their current mode
    // This way if they're in library mode, they stay in library mode
    // If they're in all recipes mode, they stay in all recipes mode
    
    // Don't clear results - let them see the search results with filters reset
    // The search will automatically trigger due to the filter change
  }, []);

  return (
    <>
      <Head>
        <title>Search Recipes | CookEase</title>
        <meta name="description" content="Search and filter recipes by ingredients, cuisine, difficulty, and more" />
      </Head>
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLibraryMode ? 'Search My Saved Recipes' : 'Find Your Perfect Recipe'}
          </h1>
          <p className="text-gray-600">
            {isLibraryMode 
              ? 'Search and filter through your saved recipes' 
              : 'Search by recipe name, ingredients, cuisine, cooking time, and more'
            }
          </p>
        </div>

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



        {/* Filter Toggle and Library Mode */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              <span>Filters</span>
            </button>
            
            <button
              onClick={() => {
                setIsLibraryMode(!isLibraryMode);
                // The useEffect will handle the search trigger
              }}
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
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {totalCount} {isLibraryMode ? 'saved recipes' : 'recipes'} found
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-orange-700"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cuisine Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
                <select
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {cuisineOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Meal Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <select
                  value={filters.mealType}
                  onChange={(e) => handleFilterChange('mealType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {mealTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Cook Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Cook Time: {filters.maxCookTime} minutes
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={filters.maxCookTime}
                  onChange={(e) => handleFilterChange('maxCookTime', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 min</span>
                  <span>120 min</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rating: {filters.minRating > 0 ? `${filters.minRating} stars` : 'Any'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Any</span>
                  <span>5 stars</span>
                </div>
              </div>

              {/* Calories Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Calories: {filters.maxCalories < 2000 ? `${filters.maxCalories} cal` : 'Any'}
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={filters.maxCalories}
                  onChange={(e) => handleFilterChange('maxCalories', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100 cal</span>
                  <span>2000+ cal</span>
                </div>
              </div>
            </div>

            {/* Tags Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Searching recipes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={performSearch}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && recipes.length === 0 && (totalCount > 0 || filters.query) && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.489.794-6.208 2.124L5.5 18.5 4 20l1.5-1.5.376-.301A7.962 7.962 0 0112 15z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more recipes.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Recipe Results */}
        {!loading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
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
        )}
      </div>

      {/* Success Notification */}
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
} 