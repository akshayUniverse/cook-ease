import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import SuccessNotification from '@/components/common/SuccessNotification';
import StarRating from '@/components/common/StarRating';

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
  fiber?: number;
  sugar?: number;
  sodium?: number;
  ingredients: Array<{
    name: string;
    amount: string;
    inPantry: boolean;
  }>;
  instructions: string[];
  tags: string[];
  rating: number;
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

interface Comment {
  id: string;
  content: string;
  rating?: number;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [servings, setServings] = useState(4);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  };

  // Fetch recipe data
  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  // Update servings when recipe loads
  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
    }
  }, [recipe]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) {
        throw new Error('Recipe not found');
      }

      const data = await response.json();
      setRecipe(data);
      
      // Fetch user's like/save status if logged in
      if (user) {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const [likeResponse, saveResponse, commentsResponse] = await Promise.all([
              fetch(`/api/recipes/${id}/like`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              fetch(`/api/recipes/${id}/save`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              fetch(`/api/recipes/${id}/comments`)
            ]);

            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              setIsLiked(likeData.isLiked);
            }

            if (saveResponse.ok) {
              const saveData = await saveResponse.json();
              setIsSaved(saveData.isSaved);
            }

            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              setComments(commentsData);
            }
          } catch (err) {
            console.error('Error fetching user status:', err);
          }
        }
      } else {
        // Still fetch comments for non-logged-in users
        try {
          const commentsResponse = await fetch(`/api/recipes/${id}/comments`);
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            setComments(commentsData);
          }
        } catch (err) {
          console.error('Error fetching comments:', err);
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    console.log('Like button clicked. User:', user ? 'logged in' : 'not logged in');
    
    if (!user) {
      alert('Please log in to like recipes');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token for like:', token ? 'found' : 'not found');
      if (!token) return;

      const method = isLiked ? 'DELETE' : 'POST';
      console.log('Like API call - Method:', method, 'Recipe ID:', id);
      
      const response = await fetch(`/api/recipes/${id}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Like API response status:', response.status);
      
      if (response.ok) {
        setIsLiked(!isLiked);
        console.log('Like status updated to:', !isLiked);
        showSuccessNotification(isLiked ? '💔 Recipe unliked' : '❤️ Recipe liked!');
      } else {
        const error = await response.json();
        console.error('Like API error:', error);
        alert(error.error || 'Failed to like recipe');
      }
    } catch (err) {
      console.error('Error liking recipe:', err);
      alert('Failed to like recipe');
    }
  };

  const handleSave = async () => {
    console.log('Save button clicked. User:', user ? 'logged in' : 'not logged in');
    
    if (!user) {
      alert('Please log in to save recipes');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token for save:', token ? 'found' : 'not found');
      if (!token) return;

      const method = isSaved ? 'DELETE' : 'POST';
      console.log('Save API call - Method:', method, 'Recipe ID:', id);
      
      const response = await fetch(`/api/recipes/${id}/save`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Save API response status:', response.status);
      
      if (response.ok) {
        setIsSaved(!isSaved);
        console.log('Save status updated to:', !isSaved);
        showSuccessNotification(isSaved ? '📋 Recipe removed from library' : '📚 Recipe saved to library!');
      } else {
        const error = await response.json();
        console.error('Save API error:', error);
        alert(error.error || 'Failed to save recipe');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      alert('Failed to save recipe');
    }
  };

  const handleAddComment = async () => {
    console.log('Comment submit clicked. User:', user ? 'logged in' : 'not logged in');
    console.log('Comment content:', newComment, 'Rating:', newRating);
    
    if (!user) {
      alert('Please log in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token for comment:', token ? 'found' : 'not found');
      if (!token) return;

      const response = await fetch(`/api/recipes/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment,
          rating: newRating,
        }),
      });

      console.log('Comment API response status:', response.status);

      if (response.ok) {
        const newCommentData = await response.json();
        console.log('Comment added successfully:', newCommentData);
        setComments([newCommentData, ...comments]);
        setNewComment('');
        setNewRating(5);
        showSuccessNotification('✨ Comment added successfully!');
        
        // Refresh recipe data to update rating
        fetchRecipe();
      } else {
        const error = await response.json();
        console.error('Comment API error:', error);
        alert(error.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    }
  };

  const calculateAdjustedIngredients = () => {
    if (!recipe) return [];
    
    const multiplier = servings / recipe.servings;
    return recipe.ingredients.map(ingredient => ({
      ...ingredient,
      amount: adjustAmount(ingredient.amount, multiplier)
    }));
  };

  const adjustAmount = (amount: string, multiplier: number): string => {
    // Simple amount adjustment - can be made more sophisticated
    const match = amount.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2];
      const adjustedValue = (value * multiplier).toFixed(1).replace('.0', '');
      return `${adjustedValue} ${unit}`;
    }
    return amount;
  };

  if (loading) {
    return (
      <>
        <Head><title>Loading Recipe | CookEase</title></Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading recipe...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !recipe) {
    return (
      <>
        <Head><title>Recipe Not Found | CookEase</title></Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Recipe not found'}</p>
            <button
              onClick={() => router.push('/home')}
              className="bg-primary text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{recipe.title} | CookEase</title>
        <meta name="description" content={recipe.description} />
      </Head>
      <Header />
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Recipe Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              {/* Recipe Image */}
              <div className="md:w-1/2">
                <div className="h-64 md:h-full relative">
                  <img
                    src={recipe.image || '/images/placeholder-recipe.svg'}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        isLiked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      ❤️
                    </button>
                    <button
                      onClick={handleSave}
                      className={`p-3 rounded-full shadow-lg transition-all ${
                        isSaved 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-600 hover:bg-blue-50'
                      }`}
                    >
                      📚
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Recipe Info */}
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center mb-2">
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full mr-2">
                    {recipe.cuisine}
                  </span>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {recipe.difficulty}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {recipe.title}
                </h1>
                
                <p className="text-gray-600 text-lg mb-6">
                  {recipe.description}
                </p>
                
                {/* Recipe Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">⏱️</div>
                    <div className="text-sm text-gray-600">Cook Time</div>
                    <div className="font-semibold">{recipe.cookTime} min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">👥</div>
                    <div className="text-sm text-gray-600">Servings</div>
                    <div className="font-semibold">{recipe.servings}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">🔥</div>
                    <div className="text-sm text-gray-600">Calories</div>
                    <div className="font-semibold">{recipe.calories}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">⭐</div>
                    <div className="text-sm text-gray-600">Rating</div>
                    <div className="font-semibold">{recipe.rating.toFixed(1)}</div>
                  </div>
                </div>
                
                {/* Author & Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    By <span className="font-semibold">{recipe.author.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowShoppingList(!showShoppingList)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      🛒 Shopping List
                    </button>
                    <button 
                      onClick={() => navigator.share ? 
                        navigator.share({
                          title: recipe.title,
                          text: recipe.description,
                          url: window.location.href
                        }) : 
                        navigator.clipboard.writeText(window.location.href).then(() => showSuccessNotification('🔗 Link copied to clipboard!'))
                      }
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      📤 Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Ingredients</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Servings:</span>
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setServings(Math.max(1, servings - 1))}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x">{servings}</span>
                      <button
                        onClick={() => setServings(servings + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {calculateAdjustedIngredients().map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="flex-1">
                        <span className="font-semibold">{ingredient.amount}</span> {ingredient.name}
                      </span>
                      {ingredient.inPantry && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          In Pantry
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Nutrition Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Nutrition Facts</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span className="font-semibold">{recipe.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein</span>
                    <span className="font-semibold">{recipe.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs</span>
                    <span className="font-semibold">{recipe.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat</span>
                    <span className="font-semibold">{recipe.fat}g</span>
                  </div>
                  {recipe.fiber && (
                    <div className="flex justify-between">
                      <span>Fiber</span>
                      <span className="font-semibold">{recipe.fiber}g</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions & Comments */}
            <div className="lg:col-span-2 space-y-8">
              {/* Instructions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Instructions</h2>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Reviews ({recipe._count.comments})
                </h3>
                
                {user && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-3">Add a Review</h4>
                    <div className="mb-3">
                      <span className="mr-2">Rating:</span>
                      <StarRating
                        rating={newRating}
                        onRatingChange={setNewRating}
                        size="md"
                        showEmoji={true}
                        showText={true}
                      />
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with this recipe..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="mt-3 bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Post Review
                    </button>
                  </div>
                )}
                
                {/* Real Comments */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center mb-2">
                          <span className="font-semibold mr-2">{comment.user.name}</span>
                          {comment.rating && (
                            <div className="flex text-yellow-400 text-sm mr-2">
                              {'⭐'.repeat(comment.rating)}
                            </div>
                          )}
                          <span className="text-gray-500 text-sm">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No reviews yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Shopping List</h3>
                <button
                  onClick={() => setShowShoppingList(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2">
                {calculateAdjustedIngredients().map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span>
                      <span className="font-semibold">{ingredient.amount}</span> {ingredient.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-2">
                <button 
                  onClick={() => {
                    const listText = calculateAdjustedIngredients()
                      .map(ing => `${ing.amount} ${ing.name}`)
                      .join('\n');
                    
                    if (navigator.share) {
                      navigator.share({
                        title: `Shopping List - ${recipe.title}`,
                        text: listText,
                      });
                    } else {
                      navigator.clipboard.writeText(listText).then(() => 
                        showSuccessNotification('📋 Shopping list copied to clipboard!')
                      );
                    }
                  }}
                  className="flex-1 bg-primary hover:bg-orange-700 text-white py-2 px-4 rounded-full font-medium transition-colors"
                >
                  📤 Share List
                </button>
                <button 
                  onClick={async () => {
                    if (!user) {
                      alert('Please log in to save shopping list');
                      return;
                    }
                    
                    try {
                      const token = localStorage.getItem('authToken');
                      if (!token) return;

                      const items = calculateAdjustedIngredients().map(ing => ({
                        name: ing.name,
                        amount: ing.amount,
                        recipeId: recipe.id,
                      }));

                      const response = await fetch('/api/shopping-list', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ items }),
                      });

                      if (response.ok) {
                        showSuccessNotification('🛒 Shopping list saved successfully!');
                      } else {
                        const error = await response.json();
                        alert(error.error || 'Failed to save shopping list');
                      }
                    } catch (err) {
                      console.error('Error saving shopping list:', err);
                      alert('Failed to save shopping list');
                    }
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-full font-medium transition-colors"
                >
                  💾 Save List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}