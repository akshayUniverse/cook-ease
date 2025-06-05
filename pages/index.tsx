import React, { useState } from "react";
import Head from "next/head";
import SearchBar from "@/components/common/SearchBar";
import MealTabs from "@/components/recipe/MealTabs";
import RecipeCard from "@/components/recipe/RecipeCard";

// Mock data for demonstration
const mockRecipes = [
  {
    id: "1",
    title: "Jollof Rice",
    image: "/images/jollof-rice.jpg", // We'll need to add these images
    price: 12.99,
    rating: 4.8,
    cookTime: "30 min",
    calories: 420,
    category: "Popular"
  },
  {
    id: "2",
    title: "Pasta Carbonara",
    image: "/images/pasta-carbonara.jpg",
    price: 10.99,
    rating: 4.5,
    cookTime: "25 min",
    calories: 380,
    category: "Pasta"
  },
  {
    id: "3",
    title: "Caesar Salad",
    image: "/images/caesar-salad.jpg",
    price: 8.99,
    rating: 4.3,
    cookTime: "15 min",
    calories: 220,
    category: "Salads"
  },
  {
    id: "4",
    title: "Avocado Toast",
    image: "/images/avocado-toast.jpg",
    price: 7.99,
    rating: 4.6,
    cookTime: "10 min",
    calories: 280,
    category: "Breakfast"
  },
];

const categories = ["Popular", "Pasta", "Salads", "Breakfast"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesCategory = selectedCategory === "Popular" || recipe.category === selectedCategory;
    const matchesSearch = searchQuery === "" || recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <Head>
        <title>CookEase - Personalized Recipes</title>
        <meta name="description" content="Discover personalized recipes tailored to your preferences" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6">Our Menu</h1>
        
        <SearchBar onSearch={handleSearch} />
        
        <MealTabs 
          categories={categories} 
          onSelectCategory={setSelectedCategory} 
        />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              image={recipe.image}
              price={recipe.price}
              rating={recipe.rating}
              cookTime={recipe.cookTime}
              calories={recipe.calories}
            />
          ))}
        </div>
      </div>
    </>
  );
}
