import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface RecipeFormData {
  title: string;
  description: string;
  image: string;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
}

const initialFormData: RecipeFormData = {
  title: '',
  description: '',
  image: '',
  cookTime: 30,
  servings: 4,
  difficulty: 'medium',
  cuisine: 'american',
  mealType: 'dinner',
  calories: 400,
  protein: 25,
  carbs: 45,
  fat: 15,
  ingredients: [{ name: '', amount: '', unit: 'cups' }],
  instructions: [''],
  tags: []
};

const cuisineOptions = [
  'american', 'italian', 'mexican', 'indian', 'chinese', 'japanese', 'thai', 'french', 'greek', 'other'
];

const tagOptions = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'quick', 'healthy', 'comfort-food', 'kid-friendly', 'spicy', 'low-carb'
];

const unitOptions = [
  'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'grams', 'kg', 'ml', 'liters', 'pieces', 'cloves', 'slices'
];

export default function AddRecipe() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleInputChange = (field: keyof RecipeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: 'cups' }]
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instructions: newInstructions }));
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Recipe title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Recipe description is required');
      return false;
    }
    if (formData.ingredients.some(ing => !ing.name.trim() || !ing.amount.trim())) {
      setError('All ingredients must have a name and amount');
      return false;
    }
    if (formData.instructions.some(inst => !inst.trim())) {
      setError('All instruction steps must be filled out');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to create recipes');
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          authorId: user?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create recipe');
      }

      const newRecipe = await response.json();
      setSuccess('Recipe created successfully!');
      
      // Redirect to the new recipe page after a short delay
      setTimeout(() => {
        router.push(`/recipe/${newRecipe.id}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to create recipes</h1>
          <button
            onClick={() => router.push('/auth')}
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Add New Recipe | CookEase</title>
        <meta name="description" content="Create and share your own recipes" />
      </Head>

      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
          <p className="text-gray-600 mb-8">Share your culinary creation with the CookEase community</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter recipe title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your recipe"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/recipe-image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add a URL to your recipe image. If left blank, a default image will be used.
                </p>
                <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">🚀 Coming Soon:</span> Direct image upload functionality will be available in a future update!
                  </p>
                </div>
              </div>
            </div>

            {/* Recipe Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Recipe Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cook Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => handleInputChange('mealType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  value={formData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nutrition Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Nutrition Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => handleInputChange('calories', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => handleInputChange('protein', parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => handleInputChange('carbs', parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={formData.fat}
                    onChange={(e) => handleInputChange('fat', parseFloat(e.target.value))}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
              
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingredient Name
                    </label>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      placeholder="e.g., Olive oil"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      placeholder="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {unitOptions.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                    disabled={formData.ingredients.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-2 text-primary hover:text-orange-700 transition-colors"
              >
                <span>+ Add Ingredient</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
              
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      placeholder={`Step ${index + 1} instructions...`}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                    disabled={formData.instructions.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addInstruction}
                className="flex items-center gap-2 text-primary hover:text-orange-700 transition-colors"
              >
                <span>+ Add Step</span>
              </button>
            </div>

            {/* Tags */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Tags</h2>
              
              <div className="flex flex-wrap gap-3">
                {tagOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Recipe...' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 