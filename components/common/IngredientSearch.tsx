import React, { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface IngredientSearchProps {
  onSearch: (ingredients: string[]) => void;
  onReset: () => void;
}

const IngredientSearch: React.FC<IngredientSearchProps> = ({ onSearch, onReset }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Common ingredients for suggestions
  const commonIngredients = [
    'chicken', 'beef', 'pork', 'fish', 'eggs', 'milk', 'cheese', 'butter',
    'tomatoes', 'onions', 'garlic', 'bell peppers', 'carrots', 'potatoes',
    'rice', 'pasta', 'bread', 'flour', 'oil', 'salt', 'pepper', 'herbs',
    'lettuce', 'spinach', 'broccoli', 'mushrooms', 'avocado', 'cucumber',
    'lemon', 'lime', 'ginger', 'soy sauce', 'vinegar', 'honey', 'sugar',
    'beans', 'corn', 'zucchini', 'cauliflower', 'asparagus', 'green beans',
    'yogurt', 'cream', 'bacon', 'sausage', 'shrimp', 'salmon', 'tuna',
    'coconut', 'nuts', 'almonds', 'walnuts', 'olive oil', 'coconut oil',
    'basil', 'oregano', 'thyme', 'rosemary', 'cilantro', 'parsley',
    'paprika', 'cumin', 'cinnamon', 'vanilla', 'chocolate', 'cocoa'
  ];

  // Filter suggestions based on input
  useEffect(() => {
    if (newIngredient.length > 0) {
      const filtered = commonIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(newIngredient.toLowerCase()) &&
        !ingredients.includes(ingredient)
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newIngredient, ingredients]);

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredient));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.trim()) {
      addIngredient(newIngredient);
    }
  };

  const handleSearch = () => {
    if (ingredients.length > 0) {
      onSearch(ingredients);
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setNewIngredient('');
    setShowSuggestions(false);
    onReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newIngredient.trim()) {
        addIngredient(newIngredient);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BeakerIcon className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold text-gray-800">What can I make with what I have?</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Add ingredients you have available, and we'll find recipes you can make with them.
      </p>

      {/* Ingredient Input */}
      <div className="relative mb-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add an ingredient (e.g., chicken, tomatoes, rice)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addIngredient(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Selected Ingredients */}
      {ingredients.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Your Ingredients ({ingredients.length}):
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-2 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Common Ingredients */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Add:</h3>
        <div className="flex flex-wrap gap-2">
          {commonIngredients.slice(0, 12).map((ingredient, index) => (
            <button
              key={index}
              onClick={() => addIngredient(ingredient)}
              disabled={ingredients.includes(ingredient)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                ingredients.includes(ingredient)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {ingredient}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSearch}
          disabled={ingredients.length === 0}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            ingredients.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-orange-700'
          }`}
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span>Find Recipes ({ingredients.length} ingredients)</span>
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">💡 Tips:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Add main ingredients first (proteins, vegetables, grains)</li>
          <li>• We'll find recipes that use ALL your ingredients</li>
          <li>• The more ingredients you add, the more specific the results</li>
          <li>• Don't worry about exact quantities - we match by ingredient name</li>
        </ul>
      </div>
    </div>
  );
};

export default IngredientSearch; 