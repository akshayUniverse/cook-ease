import React, { useState } from 'react';

interface Ingredient {
  id: string;
  name: string;
  emoji?: string;
}

interface IngredientSearchProps {
  onAddToCategory: (ingredient: string, category: 'allergies' | 'favorites') => void;
  currentAllergies: string[];
  currentFavorites: string[];
}

export default function IngredientSearchForPreferences({ 
  onAddToCategory, 
  currentAllergies, 
  currentFavorites 
}: IngredientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  // Common ingredients database for search
  const COMMON_INGREDIENTS = [
    { id: 'tomato', name: 'Tomato', emoji: '🍅' },
    { id: 'onion', name: 'Onion', emoji: '🧅' },
    { id: 'garlic', name: 'Garlic', emoji: '🧄' },
    { id: 'ginger', name: 'Ginger', emoji: '🫚' },
    { id: 'chicken', name: 'Chicken', emoji: '🍗' },
    { id: 'beef', name: 'Beef', emoji: '🥩' },
    { id: 'fish', name: 'Fish', emoji: '🐟' },
    { id: 'salmon', name: 'Salmon', emoji: '🍣' },
    { id: 'rice', name: 'Rice', emoji: '🍚' },
    { id: 'pasta', name: 'Pasta', emoji: '🍝' },
    { id: 'bread', name: 'Bread', emoji: '🍞' },
    { id: 'cheese', name: 'Cheese', emoji: '🧀' },
    { id: 'milk', name: 'Milk', emoji: '🥛' },
    { id: 'eggs', name: 'Eggs', emoji: '🥚' },
    { id: 'butter', name: 'Butter', emoji: '🧈' },
    { id: 'olive_oil', name: 'Olive Oil', emoji: '🫒' },
    { id: 'coconut', name: 'Coconut', emoji: '🥥' },
    { id: 'avocado', name: 'Avocado', emoji: '🥑' },
    { id: 'spinach', name: 'Spinach', emoji: '🥬' },
    { id: 'broccoli', name: 'Broccoli', emoji: '🥦' },
    { id: 'carrot', name: 'Carrot', emoji: '🥕' },
    { id: 'potato', name: 'Potato', emoji: '🥔' },
    { id: 'sweet_potato', name: 'Sweet Potato', emoji: '🍠' },
    { id: 'bell_pepper', name: 'Bell Pepper', emoji: '🫑' },
    { id: 'mushroom', name: 'Mushroom', emoji: '🍄' },
    { id: 'lemon', name: 'Lemon', emoji: '🍋' },
    { id: 'lime', name: 'Lime', emoji: '🟢' },
    { id: 'apple', name: 'Apple', emoji: '🍎' },
    { id: 'banana', name: 'Banana', emoji: '🍌' },
    { id: 'strawberry', name: 'Strawberry', emoji: '🍓' },
    { id: 'blueberry', name: 'Blueberry', emoji: '🫐' },
    { id: 'nuts', name: 'Nuts', emoji: '🥜' },
    { id: 'almonds', name: 'Almonds', emoji: '🌰' },
    { id: 'cashews', name: 'Cashews', emoji: '🥜' },
    { id: 'peanuts', name: 'Peanuts', emoji: '🥜' },
    { id: 'walnuts', name: 'Walnuts', emoji: '🌰' },
    { id: 'honey', name: 'Honey', emoji: '🍯' },
    { id: 'vanilla', name: 'Vanilla', emoji: '🤍' },
    { id: 'chocolate', name: 'Chocolate', emoji: '🍫' },
    { id: 'cinnamon', name: 'Cinnamon', emoji: '🟤' },
    { id: 'basil', name: 'Basil', emoji: '🌿' },
    { id: 'parsley', name: 'Parsley', emoji: '🌿' },
    { id: 'cilantro', name: 'Cilantro', emoji: '🌿' },
    { id: 'mint', name: 'Mint', emoji: '🌿' },
    { id: 'oregano', name: 'Oregano', emoji: '🌿' },
    { id: 'thyme', name: 'Thyme', emoji: '🌿' },
    { id: 'rosemary', name: 'Rosemary', emoji: '🌿' },
    { id: 'paprika', name: 'Paprika', emoji: '🌶️' },
    { id: 'turmeric', name: 'Turmeric', emoji: '🟡' },
    { id: 'cumin', name: 'Cumin', emoji: '🟤' },
    { id: 'black_pepper', name: 'Black Pepper', emoji: '⚫' },
    { id: 'salt', name: 'Salt', emoji: '🧂' },
    { id: 'sugar', name: 'Sugar', emoji: '🤍' },
    { id: 'flour', name: 'Flour', emoji: '🤍' },
    { id: 'baking_powder', name: 'Baking Powder', emoji: '🤍' },
    { id: 'yogurt', name: 'Yogurt', emoji: '🥛' },
    { id: 'cream', name: 'Cream', emoji: '🥛' },
    { id: 'soy_sauce', name: 'Soy Sauce', emoji: '🟤' },
    { id: 'vinegar', name: 'Vinegar', emoji: '🟤' },
    { id: 'wine', name: 'Wine', emoji: '🍷' },
    { id: 'beer', name: 'Beer', emoji: '🍺' }
  ];

  const searchIngredients = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const queryLower = query.toLowerCase();
    
    // Search in common ingredients
    const results = COMMON_INGREDIENTS.filter(ingredient =>
      ingredient.name.toLowerCase().includes(queryLower)
    );

    setSearchResults(results.slice(0, 10)); // Show max 10 results
    setLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    setTimeout(() => {
      if (query === searchQuery) {
        searchIngredients(query);
      }
    }, 300);
  };

  const isAlreadyInCategory = (ingredient: string, category: 'allergies' | 'favorites') => {
    if (category === 'allergies') {
      return currentAllergies.includes(ingredient.toLowerCase());
    } else {
      return currentFavorites.includes(ingredient.toLowerCase());
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🔍</span>
        Search & Add Ingredients
      </h3>
      
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for ingredients (e.g., tomato, chicken, nuts)..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">
            Click on an ingredient to add it to your allergies or favorites:
          </p>
          
          {searchResults.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{ingredient.emoji || '🥘'}</span>
                <span className="font-medium text-gray-800">{ingredient.name}</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onAddToCategory(ingredient.name.toLowerCase(), 'allergies')}
                  disabled={isAlreadyInCategory(ingredient.name, 'allergies')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isAlreadyInCategory(ingredient.name, 'allergies')
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {isAlreadyInCategory(ingredient.name, 'allergies') ? '✓ Allergy' : '+ Allergy'}
                </button>
                
                <button
                  onClick={() => onAddToCategory(ingredient.name.toLowerCase(), 'favorites')}
                  disabled={isAlreadyInCategory(ingredient.name, 'favorites')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isAlreadyInCategory(ingredient.name, 'favorites')
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isAlreadyInCategory(ingredient.name, 'favorites') ? '✓ Favorite' : '+ Favorite'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          <p>No ingredients found for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try searching for common ingredients like tomato, chicken, or rice</p>
        </div>
      )}
    </div>
  );
} 