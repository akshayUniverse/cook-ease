import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import IngredientSearchForPreferences from '@/components/common/IngredientSearchForPreferences';

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { id: 'keto', label: 'Keto', emoji: '🥑' },
  { id: 'paleo', label: 'Paleo', emoji: '🥩' },
  { id: 'low-carb', label: 'Low-Carb', emoji: '🥒' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' }
];

const ALLERGIES = [
  { id: 'nuts', label: 'Nuts', emoji: '🥜' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'dairy', label: 'Dairy', emoji: '🧀' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'soy', label: 'Soy', emoji: '🫘' },
  { id: 'wheat', label: 'Wheat', emoji: '🌾' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'sesame', label: 'Sesame', emoji: '🫴' }
];

const CUISINES = [
  { id: 'italian', label: 'Italian', emoji: '🍝' },
  { id: 'indian', label: 'Indian', emoji: '🍛' },
  { id: 'mexican', label: 'Mexican', emoji: '🌮' },
  { id: 'asian', label: 'Asian', emoji: '🍜' },
  { id: 'american', label: 'American', emoji: '🍔' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'french', label: 'French', emoji: '🥖' },
  { id: 'japanese', label: 'Japanese', emoji: '🍣' },
  { id: 'chinese', label: 'Chinese', emoji: '🥡' },
  { id: 'thai', label: 'Thai', emoji: '🍛' }
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', description: 'Simple recipes with basic techniques' },
  { id: 'intermediate', label: 'Intermediate', emoji: '👨‍🍳', description: 'More complex recipes with multiple steps' },
  { id: 'advanced', label: 'Advanced', emoji: '🏆', description: 'Challenging recipes requiring skill and time' }
];

export default function Preferences() {
  const { user, updateUserPreferences } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    cuisinePreferences: [] as string[],
    skillLevel: 'beginner' as string
  });
  
  // Track additional ingredient preferences locally
  const [favoriteIngredients, setFavoriteIngredients] = useState<string[]>([]);

  // Load user preferences on mount
  useEffect(() => {
    if (user && user.preferences) {
      setFormData({
        dietaryRestrictions: user.preferences.dietaryRestrictions || [],
        allergies: user.preferences.allergies || [],
        cuisinePreferences: user.preferences.cuisinePreferences || [],
        skillLevel: user.preferences.skillLevel || 'beginner'
      });
      
      // Load favorite ingredients from localStorage (for now)
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        try {
          setFavoriteIngredients(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Error parsing favorite ingredients:', error);
        }
      }
    }
  }, [user]);

  const handleToggle = (category: keyof typeof formData, value: string) => {
    if (category === 'skillLevel') {
      setFormData(prev => ({ ...prev, skillLevel: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      }));
    }
  };

  // Handle adding ingredients from search to categories
  const handleAddToCategory = (ingredient: string, category: 'allergies' | 'favorites') => {
    if (category === 'allergies') {
      // Add to allergies
      const normalizedIngredient = ingredient.toLowerCase();
      if (!formData.allergies.includes(normalizedIngredient)) {
        setFormData(prev => ({
          ...prev,
          allergies: [...prev.allergies, normalizedIngredient]
        }));
      }
    } else if (category === 'favorites') {
      // Add to favorite ingredients
      const normalizedIngredient = ingredient.toLowerCase();
      if (!favoriteIngredients.includes(normalizedIngredient)) {
        const newFavorites = [...favoriteIngredients, normalizedIngredient];
        setFavoriteIngredients(newFavorites);
        
        // Save to localStorage
        if (user) {
          localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
        }
      }
    }
  };

  // Remove favorite ingredient
  const removeFavoriteIngredient = (ingredient: string) => {
    const newFavorites = favoriteIngredients.filter(item => item !== ingredient);
    setFavoriteIngredients(newFavorites);
    
    if (user) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateUserPreferences(formData);
      
      // Mark that this user has set their preferences
      if (user) {
        localStorage.setItem(`preferences_set_${user.id}`, 'true');
      }
      
      setMessage('Preferences updated successfully! 🎉');
      
      // If coming from home page (first-time setup), trigger suggestions and redirect back to home
      const redirectToHome = sessionStorage.getItem('redirect_after_preferences');
      if (redirectToHome) {
        sessionStorage.removeItem('redirect_after_preferences');
        
        // Set flag to auto-trigger suggestions
        sessionStorage.setItem('auto_trigger_suggestions', 'true');
        
        setMessage('Preferences saved! Redirecting and getting your personalized suggestions...');
        setTimeout(() => {
          window.location.href = '/home';
        }, 2000);
      } else {
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to update preferences. Please try again.');
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Head>
          <title>Preferences | CookEase</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to set your preferences.</p>
            <button
              onClick={() => window.location.href = '/auth'}
              className="bg-primary text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Preferences | CookEase</title>
        <meta name="description" content="Set your dietary preferences and cooking skill level" />
      </Head>
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Preferences</h1>
              <p className="text-gray-600">Tell us about your dietary needs and cooking preferences to get personalized recipe recommendations</p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg text-center ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Ingredient Search Section */}
            <IngredientSearchForPreferences
              onAddToCategory={handleAddToCategory}
              currentAllergies={formData.allergies}
              currentFavorites={favoriteIngredients}
            />

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Favorite Ingredients Display */}
              {favoriteIngredients.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">💚 Your Favorite Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {favoriteIngredients.map(ingredient => (
                      <span
                        key={ingredient}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => removeFavoriteIngredient(ingredient)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Restrictions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🥗 Dietary Restrictions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DIETARY_RESTRICTIONS.map(restriction => (
                    <button
                      key={restriction.id}
                      type="button"
                      onClick={() => handleToggle('dietaryRestrictions', restriction.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.dietaryRestrictions.includes(restriction.id)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{restriction.emoji}</span>
                      <div className="text-sm font-medium mt-1">{restriction.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">⚠️ Allergies & Intolerances</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ALLERGIES.map(allergy => (
                    <button
                      key={allergy.id}
                      type="button"
                      onClick={() => handleToggle('allergies', allergy.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.allergies.includes(allergy.id)
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{allergy.emoji}</span>
                      <div className="text-sm font-medium mt-1">{allergy.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🌍 Favorite Cuisines</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {CUISINES.map(cuisine => (
                    <button
                      key={cuisine.id}
                      type="button"
                      onClick={() => handleToggle('cuisinePreferences', cuisine.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.cuisinePreferences.includes(cuisine.id)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{cuisine.emoji}</span>
                      <div className="text-sm font-medium mt-1">{cuisine.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">👨‍🍳 Cooking Skill Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SKILL_LEVELS.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleToggle('skillLevel', level.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.skillLevel === level.id
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{level.emoji}</span>
                        <span className="font-semibold">{level.label}</span>
                      </div>
                      <p className="text-sm opacity-90">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 