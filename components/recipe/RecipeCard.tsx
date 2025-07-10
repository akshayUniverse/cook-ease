import React from "react";
import Link from "next/link";

interface RecipeCardProps {
  id: string;
  title?: string;
  image?: string;
  price?: number;
  rating?: number;
  cookTime?: string | number;
  calories?: number;
  cuisine?: string;
  mealType?: string;
  difficulty?: string;
}

// Function to get emoji and color based on recipe type
const getRecipeEmoji = (title?: string, cuisine?: string, mealType?: string) => {
  const titleLower = title?.toLowerCase() || '';
  
  // Specific dish emojis
  if (titleLower.includes('pizza')) return '🍕';
  if (titleLower.includes('burger')) return '🍔';
  if (titleLower.includes('pasta') || titleLower.includes('spaghetti')) return '🍝';
  if (titleLower.includes('taco')) return '🌮';
  if (titleLower.includes('sushi')) return '🍣';
  if (titleLower.includes('soup')) return '🍲';
  if (titleLower.includes('salad')) return '🥗';
  if (titleLower.includes('sandwich')) return '🥪';
  if (titleLower.includes('pancake')) return '🥞';
  if (titleLower.includes('egg') || titleLower.includes('omelette')) return '🍳';
  if (titleLower.includes('rice') || titleLower.includes('biryani')) return '🍚';
  if (titleLower.includes('chicken')) return '🍗';
  if (titleLower.includes('avocado')) return '🥑';
  if (titleLower.includes('hummus')) return '🧆';
  
  // Cuisine-based emojis
  if (cuisine) {
    const cuisineLower = cuisine.toLowerCase();
    if (cuisineLower.includes('italian')) return '🍝';
    if (cuisineLower.includes('indian')) return '🍛';
    if (cuisineLower.includes('mexican')) return '🌮';
    if (cuisineLower.includes('asian')) return '🍜';
    if (cuisineLower.includes('american')) return '🍔';
    if (cuisineLower.includes('mediterranean')) return '🫒';
    if (cuisineLower.includes('french')) return '🥖';
  }
  
  // Meal type emojis
  if (mealType) {
    const mealTypeLower = mealType.toLowerCase();
    if (mealTypeLower.includes('breakfast')) return '🥞';
    if (mealTypeLower.includes('lunch')) return '🥗';
    if (mealTypeLower.includes('dinner')) return '🍽️';
  }
  
  // Default
  return '🍽️';
};

const getRecipeColor = (cuisine?: string, mealType?: string) => {
  if (cuisine) {
    const cuisineLower = cuisine.toLowerCase();
    if (cuisineLower.includes('italian')) return '#e8f5e8';
    if (cuisineLower.includes('indian')) return '#fff5e6';
    if (cuisineLower.includes('mexican')) return '#ffe6e6';
    if (cuisineLower.includes('asian')) return '#f0f8ff';
    if (cuisineLower.includes('american')) return '#fff0f0';
    if (cuisineLower.includes('mediterranean')) return '#f0fff0';
    if (cuisineLower.includes('french')) return '#f8f8ff';
  }
  
  if (mealType) {
    const mealTypeLower = mealType.toLowerCase();
    if (mealTypeLower.includes('breakfast')) return '#fff8e1';
    if (mealTypeLower.includes('lunch')) return '#e8f5e8';
    if (mealTypeLower.includes('dinner')) return '#f3e5f5';
  }
  
  return '#f5f5f5';
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  image,
  price,
  rating,
  cookTime,
  calories,
  cuisine,
  mealType,
  difficulty
}) => {
  const emoji = getRecipeEmoji(title, cuisine, mealType);
  const bgColor = getRecipeColor(cuisine, mealType);
  
  return (
    <Link href={`/recipe/${id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer">
        <div className="aspect-square w-full mb-3 rounded-lg overflow-hidden">
          {image && !image.includes('placeholder') ? (
            <img 
            src={image}
            alt={title || 'Recipe image'}
              className="w-full h-full object-cover"
          />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <span className="text-4xl">{emoji}</span>
            </div>
          )}
        </div>
        
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{title || 'Untitled Recipe'}</h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          {cookTime && (
            <span className="flex items-center">
              ⏱️ {typeof cookTime === 'number' ? `${cookTime} min` : cookTime}
            </span>
          )}
          {calories && (
            <span className="flex items-center">
              🔥 {calories} cal
            </span>
          )}
          </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {rating && (
              <span className="text-yellow-400 mr-1">
                ⭐ {rating.toFixed(1)}
              </span>
            )}
            {difficulty && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {difficulty}
              </span>
            )}
          </div>
          {price && (
            <span className="font-semibold text-primary">${price}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;