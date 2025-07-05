import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const recipeData = [
  // Indian Recipes
  {
    title: "Aloo Paratha",
    description: "Traditional Indian flatbread stuffed with spiced potato filling, served with yogurt and pickle.",
    image: "/images/dishes/aloo-paratha.jpg",
    cookTime: 45,
    servings: 4,
    difficulty: "medium",
    cuisine: "indian",
    mealType: "breakfast",
    calories: 350,
    protein: 8,
    carbs: 50,
    fat: 12,
    fiber: 4,
    ingredients: JSON.stringify([
      { name: "Whole wheat flour", amount: "2 cups", inPantry: true },
      { name: "Potatoes", amount: "3 large", inPantry: true },
      { name: "Ghee", amount: "3 tbsp", inPantry: false },
      { name: "Cumin seeds", amount: "1 tsp", inPantry: true },
      { name: "Ginger", amount: "1 inch piece", inPantry: true },
      { name: "Green chilies", amount: "2", inPantry: true },
      { name: "Salt", amount: "to taste", inPantry: true },
      { name: "Red chili powder", amount: "1/2 tsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Boil potatoes until tender, peel and mash",
      "Mix mashed potatoes with spices, ginger, and chilies",
      "Make dough with flour, water, and salt",
      "Roll small portions, stuff with potato filling",
      "Seal edges and roll again carefully",
      "Cook on hot tawa with ghee until golden brown",
      "Serve hot with yogurt and pickle"
    ]),
    tags: JSON.stringify(["vegetarian", "indian", "breakfast", "comfort-food"])
  },
  {
    title: "Paneer Butter Masala",
    description: "Creamy tomato-based curry with cottage cheese cubes in a rich, aromatic sauce.",
    image: "/images/dishes/paneer-butter-masala.jpg",
    cookTime: 30,
    servings: 4,
    difficulty: "medium",
    cuisine: "indian",
    mealType: "dinner",
    calories: 420,
    protein: 15,
    carbs: 30,
    fat: 25,
    fiber: 5,
    ingredients: JSON.stringify([
      { name: "Paneer", amount: "300g", inPantry: false },
      { name: "Tomatoes", amount: "4 large", inPantry: true },
      { name: "Heavy cream", amount: "1/2 cup", inPantry: false },
      { name: "Butter", amount: "3 tbsp", inPantry: true },
      { name: "Onion", amount: "1 large", inPantry: true },
      { name: "Ginger-garlic paste", amount: "2 tbsp", inPantry: true },
      { name: "Garam masala", amount: "1 tsp", inPantry: true },
      { name: "Red chili powder", amount: "1 tsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Blend tomatoes to smooth puree",
      "Sauté onions until golden, add ginger-garlic paste",
      "Add tomato puree and cook until oil separates",
      "Add spices and cook for 2 minutes",
      "Add paneer cubes and cream",
      "Simmer for 10 minutes",
      "Garnish with butter and serve with rice or naan"
    ]),
    tags: JSON.stringify(["vegetarian", "indian", "creamy", "dinner"])
  },
  {
    title: "Chicken Biryani",
    description: "Fragrant basmati rice layered with spiced chicken, cooked in aromatic spices and saffron.",
    image: "/images/dishes/chicken-biryani.jpg",
    cookTime: 90,
    servings: 6,
    difficulty: "hard",
    cuisine: "indian",
    mealType: "dinner",
    calories: 580,
    protein: 35,
    carbs: 65,
    fat: 18,
    fiber: 3,
    ingredients: JSON.stringify([
      { name: "Basmati rice", amount: "2 cups", inPantry: true },
      { name: "Chicken", amount: "1 kg", inPantry: false },
      { name: "Yogurt", amount: "1 cup", inPantry: false },
      { name: "Saffron", amount: "pinch", inPantry: false },
      { name: "Fried onions", amount: "1 cup", inPantry: false },
      { name: "Mint leaves", amount: "1/2 cup", inPantry: false },
      { name: "Biryani masala", amount: "2 tbsp", inPantry: true },
      { name: "Ghee", amount: "4 tbsp", inPantry: false }
    ]),
    instructions: JSON.stringify([
      "Marinate chicken in yogurt and spices for 2 hours",
      "Soak rice in water for 30 minutes",
      "Cook rice until 70% done",
      "Cook marinated chicken until tender",
      "Layer rice and chicken alternately",
      "Top with saffron milk, fried onions, and mint",
      "Cover and cook on low heat for 45 minutes",
      "Let it rest for 10 minutes before serving"
    ]),
    tags: JSON.stringify(["non-vegetarian", "indian", "festive", "aromatic"])
  },

  // Italian Recipes
  {
    title: "Pasta Carbonara",
    description: "Classic Roman pasta dish with eggs, cheese, pancetta, and black pepper creating a creamy sauce.",
    image: "/images/dishes/pasta-carbonara.jpg",
    cookTime: 20,
    servings: 4,
    difficulty: "medium",
    cuisine: "italian",
    mealType: "dinner",
    calories: 390,
    protein: 18,
    carbs: 45,
    fat: 15,
    fiber: 3,
    ingredients: JSON.stringify([
      { name: "Spaghetti", amount: "400g", inPantry: true },
      { name: "Pancetta", amount: "150g", inPantry: false },
      { name: "Eggs", amount: "3 large", inPantry: true },
      { name: "Parmesan cheese", amount: "100g", inPantry: false },
      { name: "Black pepper", amount: "1 tsp", inPantry: true },
      { name: "Salt", amount: "to taste", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Cook spaghetti in salted boiling water until al dente",
      "Meanwhile, fry pancetta until crispy",
      "Beat eggs with grated Parmesan and black pepper",
      "Drain pasta, reserving 1 cup pasta water",
      "Quickly mix hot pasta with egg mixture off heat",
      "Add pancetta and pasta water to create creamy sauce",
      "Serve immediately with extra Parmesan"
    ]),
    tags: JSON.stringify(["italian", "quick", "creamy", "classic"])
  },
  {
    title: "Margherita Pizza",
    description: "Traditional Neapolitan pizza with fresh tomatoes, mozzarella, basil, and olive oil.",
    image: "/images/dishes/margherita-pizza.jpg",
    cookTime: 25,
    servings: 2,
    difficulty: "medium",
    cuisine: "italian",
    mealType: "dinner",
    calories: 320,
    protein: 14,
    carbs: 42,
    fat: 11,
    fiber: 3,
    ingredients: JSON.stringify([
      { name: "Pizza dough", amount: "1 ball", inPantry: false },
      { name: "Tomato sauce", amount: "1/2 cup", inPantry: true },
      { name: "Fresh mozzarella", amount: "200g", inPantry: false },
      { name: "Fresh basil", amount: "10 leaves", inPantry: false },
      { name: "Olive oil", amount: "2 tbsp", inPantry: true },
      { name: "Salt", amount: "to taste", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Preheat oven to 250°C (480°F)",
      "Roll out pizza dough on floured surface",
      "Spread tomato sauce evenly",
      "Add torn mozzarella pieces",
      "Drizzle with olive oil and season",
      "Bake for 10-12 minutes until crust is golden",
      "Top with fresh basil leaves before serving"
    ]),
    tags: JSON.stringify(["italian", "vegetarian", "classic", "quick"])
  },

  // Mexican Recipes
  {
    title: "Chicken Tacos",
    description: "Soft corn tortillas filled with seasoned chicken, fresh salsa, and creamy avocado.",
    image: "/images/dishes/chicken-tacos.jpg",
    cookTime: 25,
    servings: 4,
    difficulty: "easy",
    cuisine: "mexican",
    mealType: "lunch",
    calories: 285,
    protein: 22,
    carbs: 25,
    fat: 12,
    fiber: 4,
    ingredients: JSON.stringify([
      { name: "Chicken breast", amount: "500g", inPantry: false },
      { name: "Corn tortillas", amount: "8", inPantry: false },
      { name: "Avocado", amount: "2", inPantry: false },
      { name: "Tomatoes", amount: "2", inPantry: true },
      { name: "Onion", amount: "1", inPantry: true },
      { name: "Lime", amount: "2", inPantry: false },
      { name: "Cumin", amount: "1 tsp", inPantry: true },
      { name: "Chili powder", amount: "1 tsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Season chicken with cumin, chili powder, and salt",
      "Cook chicken in hot pan until done, then shred",
      "Warm tortillas in dry pan",
      "Dice tomatoes and onions for salsa",
      "Mash avocado with lime juice",
      "Assemble tacos with chicken, salsa, and avocado",
      "Serve with lime wedges"
    ]),
    tags: JSON.stringify(["mexican", "quick", "healthy", "protein-rich"])
  },

  // Asian Recipes
  {
    title: "Chicken Fried Rice",
    description: "Wok-fried rice with tender chicken, vegetables, and scrambled eggs in savory soy sauce.",
    image: "/images/dishes/chicken-fried-rice.jpg",
    cookTime: 20,
    servings: 4,
    difficulty: "easy",
    cuisine: "asian",
    mealType: "dinner",
    calories: 340,
    protein: 20,
    carbs: 48,
    fat: 8,
    fiber: 2,
    ingredients: JSON.stringify([
      { name: "Cooked rice", amount: "3 cups", inPantry: true },
      { name: "Chicken breast", amount: "300g", inPantry: false },
      { name: "Eggs", amount: "2", inPantry: true },
      { name: "Mixed vegetables", amount: "1 cup", inPantry: false },
      { name: "Soy sauce", amount: "3 tbsp", inPantry: true },
      { name: "Garlic", amount: "3 cloves", inPantry: true },
      { name: "Green onions", amount: "3", inPantry: false },
      { name: "Vegetable oil", amount: "2 tbsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Cut chicken into small pieces and cook until done",
      "Scramble eggs and set aside",
      "Heat oil in wok, add garlic",
      "Add rice and stir-fry to break up clumps",
      "Add chicken, vegetables, and soy sauce",
      "Add scrambled eggs back to wok",
      "Garnish with chopped green onions"
    ]),
    tags: JSON.stringify(["asian", "quick", "one-pot", "leftover-friendly"])
  },

  // American Recipes
  {
    title: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, onion, and special sauce on a toasted bun.",
    image: "/images/dishes/classic-burger.jpg",
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "american",
    mealType: "lunch",
    calories: 520,
    protein: 25,
    carbs: 35,
    fat: 28,
    fiber: 3,
    ingredients: JSON.stringify([
      { name: "Ground beef", amount: "500g", inPantry: false },
      { name: "Burger buns", amount: "4", inPantry: false },
      { name: "Lettuce", amount: "4 leaves", inPantry: false },
      { name: "Tomato", amount: "1 large", inPantry: true },
      { name: "Onion", amount: "1", inPantry: true },
      { name: "Cheese", amount: "4 slices", inPantry: false },
      { name: "Mayonnaise", amount: "4 tbsp", inPantry: true },
      { name: "Ketchup", amount: "2 tbsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Form ground beef into 4 patties",
      "Season patties with salt and pepper",
      "Cook patties in hot pan for 3-4 minutes per side",
      "Add cheese in last minute of cooking",
      "Toast burger buns lightly",
      "Assemble burgers with sauce, lettuce, tomato, onion",
      "Serve immediately with fries"
    ]),
    tags: JSON.stringify(["american", "quick", "comfort-food", "classic"])
  },

  // Healthy/Quick Options
  {
    title: "Greek Salad",
    description: "Fresh Mediterranean salad with tomatoes, cucumbers, olives, and feta cheese.",
    image: "/images/dishes/greek-salad.jpg",
    cookTime: 10,
    servings: 4,
    difficulty: "easy",
    cuisine: "mediterranean",
    mealType: "lunch",
    calories: 180,
    protein: 8,
    carbs: 12,
    fat: 14,
    fiber: 5,
    ingredients: JSON.stringify([
      { name: "Tomatoes", amount: "3 large", inPantry: true },
      { name: "Cucumber", amount: "2", inPantry: false },
      { name: "Red onion", amount: "1/2", inPantry: true },
      { name: "Feta cheese", amount: "150g", inPantry: false },
      { name: "Black olives", amount: "1/2 cup", inPantry: false },
      { name: "Olive oil", amount: "1/4 cup", inPantry: true },
      { name: "Lemon juice", amount: "2 tbsp", inPantry: false },
      { name: "Oregano", amount: "1 tsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Chop tomatoes and cucumbers into chunks",
      "Slice red onion thinly",
      "Combine vegetables in large bowl",
      "Add crumbled feta and olives",
      "Whisk olive oil, lemon juice, and oregano",
      "Pour dressing over salad",
      "Toss gently and serve immediately"
    ]),
    tags: JSON.stringify(["mediterranean", "healthy", "quick", "vegetarian", "no-cook"])
  },

  // Breakfast Options
  {
    title: "Avocado Toast",
    description: "Toasted sourdough topped with smashed avocado, tomatoes, and a perfectly poached egg.",
    image: "/images/dishes/avocado-toast.jpg",
    cookTime: 8,
    servings: 2,
    difficulty: "easy",
    cuisine: "modern",
    mealType: "breakfast",
    calories: 290,
    protein: 12,
    carbs: 25,
    fat: 18,
    fiber: 8,
    ingredients: JSON.stringify([
      { name: "Sourdough bread", amount: "4 slices", inPantry: false },
      { name: "Avocado", amount: "2 ripe", inPantry: false },
      { name: "Eggs", amount: "2", inPantry: true },
      { name: "Cherry tomatoes", amount: "1/2 cup", inPantry: false },
      { name: "Lemon juice", amount: "1 tbsp", inPantry: false },
      { name: "Salt", amount: "to taste", inPantry: true },
      { name: "Black pepper", amount: "to taste", inPantry: true },
      { name: "Red pepper flakes", amount: "pinch", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Toast bread until golden brown",
      "Mash avocado with lemon juice, salt, and pepper",
      "Poach eggs in simmering water",
      "Spread avocado mixture on toast",
      "Top with halved cherry tomatoes",
      "Place poached egg on top",
      "Sprinkle with red pepper flakes"
    ]),
    tags: JSON.stringify(["healthy", "quick", "breakfast", "vegetarian", "trendy"])
  },
  
  // More recipes for variety...
  {
    title: "Chicken Tikka Masala",
    description: "Tender chicken in a creamy, spiced tomato sauce - Britain's favorite Indian dish.",
    image: "/images/dishes/chicken-tikka-masala.jpg",
    cookTime: 45,
    servings: 4,
    difficulty: "medium",
    cuisine: "indian",
    mealType: "dinner",
    calories: 480,
    protein: 32,
    carbs: 20,
    fat: 28,
    fiber: 4,
    ingredients: JSON.stringify([
      { name: "Chicken breast", amount: "600g", inPantry: false },
      { name: "Yogurt", amount: "1/2 cup", inPantry: false },
      { name: "Heavy cream", amount: "1/2 cup", inPantry: false },
      { name: "Tomato puree", amount: "400g", inPantry: true },
      { name: "Tikka masala spice", amount: "2 tbsp", inPantry: true },
      { name: "Ginger-garlic paste", amount: "2 tbsp", inPantry: true },
      { name: "Onion", amount: "1 large", inPantry: true },
      { name: "Butter", amount: "2 tbsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Marinate chicken in yogurt and half the spices for 2 hours",
      "Grill or pan-fry chicken until cooked through",
      "Sauté onions until golden, add ginger-garlic paste",
      "Add remaining spices and cook for 1 minute",
      "Add tomato puree and simmer for 15 minutes",
      "Add cream and cooked chicken",
      "Simmer for 10 minutes, garnish with coriander"
    ]),
    tags: JSON.stringify(["indian", "creamy", "popular", "restaurant-style"])
  },

  // More Breakfast Options
  {
    title: "Fluffy Pancakes",
    description: "Classic American pancakes that are light, fluffy, and perfect with maple syrup.",
    image: "/images/dishes/pancakes.jpg",
    cookTime: 20,
    servings: 4,
    difficulty: "easy",
    cuisine: "american",
    mealType: "breakfast",
    calories: 280,
    protein: 6,
    carbs: 35,
    fat: 12,
    fiber: 2,
    ingredients: JSON.stringify([
      { name: "All-purpose flour", amount: "2 cups", inPantry: true },
      { name: "Milk", amount: "1.5 cups", inPantry: true },
      { name: "Eggs", amount: "2", inPantry: true },
      { name: "Baking powder", amount: "2 tsp", inPantry: true },
      { name: "Sugar", amount: "2 tbsp", inPantry: true },
      { name: "Salt", amount: "1 tsp", inPantry: true },
      { name: "Butter", amount: "3 tbsp", inPantry: true },
      { name: "Vanilla extract", amount: "1 tsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Mix dry ingredients in a large bowl",
      "Whisk wet ingredients separately",
      "Combine wet and dry ingredients until just mixed",
      "Heat griddle or pan over medium heat",
      "Pour 1/4 cup batter for each pancake",
      "Cook until bubbles form, then flip",
      "Serve hot with butter and maple syrup"
    ]),
    tags: JSON.stringify(["breakfast", "american", "quick", "family-friendly"])
  },

  {
    title: "Vegetable Omelette",
    description: "Healthy breakfast omelette packed with fresh vegetables and herbs.",
    image: "/images/dishes/omelette.jpg",
    cookTime: 15,
    servings: 2,
    difficulty: "easy",
    cuisine: "french",
    mealType: "breakfast",
    calories: 220,
    protein: 18,
    carbs: 8,
    fat: 14,
    fiber: 3,
    ingredients: JSON.stringify([
      { name: "Eggs", amount: "4", inPantry: true },
      { name: "Bell peppers", amount: "1", inPantry: false },
      { name: "Onion", amount: "1/2", inPantry: true },
      { name: "Mushrooms", amount: "1/2 cup", inPantry: false },
      { name: "Cheese", amount: "1/4 cup", inPantry: false },
      { name: "Butter", amount: "2 tbsp", inPantry: true },
      { name: "Salt", amount: "to taste", inPantry: true },
      { name: "Pepper", amount: "to taste", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Whisk eggs with salt and pepper",
      "Sauté vegetables until tender",
      "Heat butter in non-stick pan",
      "Pour in eggs, let set for 1 minute",
      "Add vegetables and cheese to one half",
      "Fold omelette in half",
      "Serve immediately"
    ]),
    tags: JSON.stringify(["breakfast", "vegetarian", "healthy", "quick"])
  },

  // More Lunch Options
  {
    title: "Caesar Salad",
    description: "Classic Caesar salad with crisp romaine lettuce, parmesan cheese, and creamy dressing.",
    image: "/images/dishes/caesar-salad.jpg",
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "american",
    mealType: "lunch",
    calories: 190,
    protein: 8,
    carbs: 12,
    fat: 14,
    fiber: 4,
    ingredients: JSON.stringify([
      { name: "Romaine lettuce", amount: "2 heads", inPantry: false },
      { name: "Parmesan cheese", amount: "1/2 cup", inPantry: false },
      { name: "Croutons", amount: "1 cup", inPantry: false },
      { name: "Caesar dressing", amount: "1/4 cup", inPantry: false },
      { name: "Lemon juice", amount: "2 tbsp", inPantry: false },
      { name: "Black pepper", amount: "to taste", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Wash and chop romaine lettuce",
      "Prepare homemade croutons or use store-bought",
      "Mix lettuce with Caesar dressing",
      "Add grated Parmesan cheese",
      "Top with croutons",
      "Squeeze fresh lemon juice",
      "Season with black pepper"
    ]),
    tags: JSON.stringify(["lunch", "salad", "vegetarian", "classic"])
  },

  {
    title: "Grilled Chicken Sandwich",
    description: "Juicy grilled chicken breast with lettuce, tomato, and mayo on toasted bread.",
    image: "/images/dishes/chicken-sandwich.jpg",
    cookTime: 25,
    servings: 2,
    difficulty: "easy",
    cuisine: "american",
    mealType: "lunch",
    calories: 420,
    protein: 35,
    carbs: 32,
    fat: 18,
    fiber: 3,
    ingredients: JSON.stringify([
      { name: "Chicken breast", amount: "2 pieces", inPantry: false },
      { name: "Bread", amount: "4 slices", inPantry: true },
      { name: "Lettuce", amount: "4 leaves", inPantry: false },
      { name: "Tomato", amount: "1", inPantry: true },
      { name: "Mayonnaise", amount: "2 tbsp", inPantry: true },
      { name: "Olive oil", amount: "2 tbsp", inPantry: true },
      { name: "Salt", amount: "to taste", inPantry: true },
      { name: "Pepper", amount: "to taste", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Season chicken with salt and pepper",
      "Grill chicken until cooked through",
      "Toast bread slices",
      "Slice tomato",
      "Spread mayo on bread",
      "Assemble sandwich with chicken, lettuce, and tomato",
      "Serve with fries or salad"
    ]),
    tags: JSON.stringify(["lunch", "protein-rich", "grilled", "sandwich"])
  },

  // More Dinner Options
  {
    title: "Spaghetti Bolognese",
    description: "Traditional Italian pasta with rich meat sauce, slow-cooked to perfection.",
    image: "/images/dishes/spaghetti-bolognese.jpg",
    cookTime: 60,
    servings: 4,
    difficulty: "medium",
    cuisine: "italian",
    mealType: "dinner",
    calories: 520,
    protein: 25,
    carbs: 55,
    fat: 22,
    fiber: 4,
    ingredients: JSON.stringify([
      { name: "Spaghetti", amount: "400g", inPantry: true },
      { name: "Ground beef", amount: "500g", inPantry: false },
      { name: "Onion", amount: "1 large", inPantry: true },
      { name: "Carrots", amount: "2", inPantry: true },
      { name: "Celery", amount: "2 stalks", inPantry: false },
      { name: "Tomato sauce", amount: "400g", inPantry: true },
      { name: "Red wine", amount: "1/2 cup", inPantry: false },
      { name: "Parmesan cheese", amount: "1/2 cup", inPantry: false }
    ]),
    instructions: JSON.stringify([
      "Dice onion, carrots, and celery",
      "Brown ground beef in large pan",
      "Add vegetables and cook until soft",
      "Add tomato sauce and wine",
      "Simmer for 45 minutes",
      "Cook spaghetti according to package directions",
      "Serve sauce over pasta with Parmesan"
    ]),
    tags: JSON.stringify(["dinner", "italian", "comfort-food", "family-meal"])
  },

  {
    title: "Chicken Stir Fry",
    description: "Quick and healthy stir-fry with chicken and fresh vegetables in savory sauce.",
    image: "/images/dishes/chicken-stir-fry.jpg",
    cookTime: 20,
    servings: 4,
    difficulty: "easy",
    cuisine: "asian",
    mealType: "dinner",
    calories: 310,
    protein: 28,
    carbs: 20,
    fat: 12,
    fiber: 4,
    ingredients: JSON.stringify([
      { name: "Chicken breast", amount: "500g", inPantry: false },
      { name: "Mixed vegetables", amount: "3 cups", inPantry: false },
      { name: "Soy sauce", amount: "3 tbsp", inPantry: true },
      { name: "Garlic", amount: "3 cloves", inPantry: true },
      { name: "Ginger", amount: "1 inch", inPantry: true },
      { name: "Vegetable oil", amount: "2 tbsp", inPantry: true },
      { name: "Sesame oil", amount: "1 tsp", inPantry: true },
      { name: "Cornstarch", amount: "1 tbsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Cut chicken into bite-sized pieces",
      "Marinate chicken in soy sauce and cornstarch",
      "Heat wok or large pan over high heat",
      "Stir-fry chicken until cooked through",
      "Add vegetables and stir-fry until crisp-tender",
      "Add garlic, ginger, and remaining sauce",
      "Serve over rice"
    ]),
    tags: JSON.stringify(["dinner", "asian", "healthy", "quick"])
  },

  // Snacks and Light Meals
  {
    title: "Hummus Bowl",
    description: "Creamy homemade hummus with fresh vegetables and pita bread.",
    image: "/images/dishes/hummus-bowl.jpg",
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "mediterranean",
    mealType: "lunch",
    calories: 180,
    protein: 8,
    carbs: 20,
    fat: 8,
    fiber: 6,
    ingredients: JSON.stringify([
      { name: "Chickpeas", amount: "1 can", inPantry: true },
      { name: "Tahini", amount: "2 tbsp", inPantry: false },
      { name: "Lemon juice", amount: "2 tbsp", inPantry: false },
      { name: "Garlic", amount: "2 cloves", inPantry: true },
      { name: "Olive oil", amount: "3 tbsp", inPantry: true },
      { name: "Cucumber", amount: "1", inPantry: false },
      { name: "Cherry tomatoes", amount: "1 cup", inPantry: false },
      { name: "Pita bread", amount: "4 pieces", inPantry: false }
    ]),
    instructions: JSON.stringify([
      "Drain and rinse chickpeas",
      "Blend chickpeas, tahini, lemon juice, and garlic",
      "Add water gradually until smooth",
      "Drizzle with olive oil",
      "Serve with chopped vegetables and pita",
      "Garnish with paprika and herbs"
    ]),
    tags: JSON.stringify(["vegetarian", "healthy", "mediterranean", "protein-rich"])
  },

  {
    title: "Chicken Soup",
    description: "Comforting homemade chicken soup with vegetables and tender chicken pieces.",
    image: "/images/dishes/chicken-soup.jpg",
    cookTime: 45,
    servings: 6,
    difficulty: "easy",
    cuisine: "american",
    mealType: "lunch",
    calories: 190,
    protein: 20,
    carbs: 15,
    fat: 6,
    fiber: 3,
    ingredients: JSON.stringify([
      { name: "Chicken thighs", amount: "4 pieces", inPantry: false },
      { name: "Onion", amount: "1", inPantry: true },
      { name: "Carrots", amount: "3", inPantry: true },
      { name: "Celery", amount: "3 stalks", inPantry: false },
      { name: "Chicken broth", amount: "6 cups", inPantry: true },
      { name: "Egg noodles", amount: "2 cups", inPantry: true },
      { name: "Bay leaves", amount: "2", inPantry: true },
      { name: "Thyme", amount: "1 tsp", inPantry: true }
    ]),
    instructions: JSON.stringify([
      "Brown chicken thighs in large pot",
      "Add chopped vegetables and sauté",
      "Add broth, bay leaves, and thyme",
      "Simmer for 30 minutes",
      "Remove chicken, shred, and return to pot",
      "Add noodles and cook until tender",
      "Season with salt and pepper"
    ]),
    tags: JSON.stringify(["comfort-food", "healthy", "soup", "family-meal"])
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user first
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cookease.com' },
    update: {},
    create: {
      email: 'demo@cookease.com',
      name: 'Demo Chef',
      password: hashedPassword,
      dietaryRestrictions: JSON.stringify(['vegetarian']),
      allergies: JSON.stringify(['nuts']),
      cuisinePreferences: JSON.stringify(['italian', 'indian', 'mexican']),
      skillLevel: 'intermediate'
    }
  });

  console.log('👤 Created demo user:', demoUser.email);

  // Create recipes
  console.log('🍳 Creating recipes...');
  
  for (const recipe of recipeData) {
    await prisma.recipe.create({
      data: {
        ...recipe,
        authorId: demoUser.id
      }
    });
  }

  console.log(`✅ Created ${recipeData.length} recipes`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 