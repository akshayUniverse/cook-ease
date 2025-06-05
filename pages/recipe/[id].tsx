import React from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import NutritionBadge from "@/components/recipe/NutritionBadge";

// Mock data for demonstration
const mockRecipes = [
  {
    id: "1",
    title: "Jollof Rice",
    image: "/images/jollof-rice.jpg",
    price: 12.99,
    rating: 4.8,
    cookTime: "30 min",
    calories: 420,
    category: "Popular",
    description: "A flavorful West African rice dish cooked in a rich tomato sauce with aromatic spices.",
    ingredients: [
      "2 cups long-grain rice",
      "1 can (400g) tomatoes",
      "2 red bell peppers",
      "2 medium onions",
      "3 cloves garlic",
      "1 tbsp curry powder",
      "1 tsp thyme",
      "2 bay leaves",
      "1 cup vegetable stock",
      "3 tbsp oil"
    ],
    instructions: [
      "Blend tomatoes, peppers, and one onion until smooth.",
      "Heat oil and sauté the remaining chopped onion until translucent.",
      "Add the blended mixture and cook for 10-15 minutes.",
      "Add spices and cook for another 5 minutes.",
      "Add washed rice and stock, stir well.",
      "Cover and cook on low heat for 25-30 minutes until rice is tender."
    ],
    nutrition: {
      calories: 420,
      protein: 8,
      carbs: 65,
      fat: 12
    }
  },
  // Add more recipes here
];

export default function RecipeDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const recipe = mockRecipes.find(r => r.id === id);
  
  if (!recipe) {
    return <div className="text-center py-10">Recipe not found</div>;
  }

  return (
    <>
      <Head>
        <title>{recipe.title} - CookEase</title>
        <meta name="description" content={recipe.description} />
      </Head>

      <div className="pb-10">
        <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
          />
          <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{recipe.title}</h1>
          <div className="text-xl font-bold text-primary-600">${recipe.price.toFixed(2)}</div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{recipe.description}</p>
          
          <div className="flex space-x-3 mb-6">
            <NutritionBadge label="Calories" value={recipe.nutrition.calories} unit="kcal" />
            <NutritionBadge label="Protein" value={recipe.nutrition.protein} unit="g" color="bg-blue-100 text-blue-800" />
            <NutritionBadge label="Carbs" value={recipe.nutrition.carbs} unit="g" color="bg-yellow-100 text-yellow-800" />
            <NutritionBadge label="Fat" value={recipe.nutrition.fat} unit="g" color="bg-red-100 text-red-800" />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
          <ul className="list-disc pl-5 space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        <button className="w-full py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-colors">
          Add to Cart
        </button>
      </div>
    </>
  );
}