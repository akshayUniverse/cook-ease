import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { recipeAPIService } from '../utils/apiIntegration';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with REAL API data...');

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

  // Clear existing data in correct order to handle foreign key constraints
  console.log('🗑️ Clearing existing data...');
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.savedRecipe.deleteMany({});
  await prisma.recipe.deleteMany({});
  console.log('✅ Cleared all existing recipes and related data');

  // Fetch real recipes from APIs
  console.log('📡 Fetching real recipes from APIs...');
  
  try {
    // Get Indian recipes
    console.log('🇮🇳 Fetching Indian recipes...');
    const indianRecipes = await recipeAPIService.getEnhancedRecipes({
      cuisine: 'Indian',
      count: 15,
      includeNutrition: true,
      includeImages: true
    });
    console.log(`✅ Fetched ${indianRecipes.length} Indian recipes`);

    // Get Italian recipes
    console.log('🇮🇹 Fetching Italian recipes...');
    const italianRecipes = await recipeAPIService.getEnhancedRecipes({
      cuisine: 'Italian',
      count: 10,
      includeNutrition: true,
      includeImages: true
    });
    console.log(`✅ Fetched ${italianRecipes.length} Italian recipes`);

    // Get Mexican recipes
    console.log('🇲🇽 Fetching Mexican recipes...');
    const mexicanRecipes = await recipeAPIService.getEnhancedRecipes({
      cuisine: 'Mexican',
      count: 10,
      includeNutrition: true,
      includeImages: true
    });
    console.log(`✅ Fetched ${mexicanRecipes.length} Mexican recipes`);

    // Get Chinese recipes
    console.log('🇨🇳 Fetching Chinese recipes...');
    const chineseRecipes = await recipeAPIService.getEnhancedRecipes({
      cuisine: 'Chinese',
      count: 8,
      includeNutrition: true,
      includeImages: true
    });
    console.log(`✅ Fetched ${chineseRecipes.length} Chinese recipes`);

    // Get some random international recipes
    console.log('🌍 Fetching international recipes...');
    const internationalRecipes = await recipeAPIService.getEnhancedRecipes({
      cuisine: 'British', // This will get diverse recipes
      count: 7,
      includeNutrition: true,
      includeImages: true
    });
    console.log(`✅ Fetched ${internationalRecipes.length} international recipes`);

    // Combine all recipes
    const allRecipes = [
      ...indianRecipes,
      ...italianRecipes,
      ...mexicanRecipes,
      ...chineseRecipes,
      ...internationalRecipes
    ];

    console.log(`📚 Total recipes to seed: ${allRecipes.length}`);

    // Save recipes to database
    console.log('💾 Saving recipes to database...');
    let successCount = 0;
    let errorCount = 0;

    for (const recipe of allRecipes) {
      try {
        await prisma.recipe.create({
          data: {
            title: recipe.title,
            description: recipe.description,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            cuisine: recipe.cuisine,
            mealType: recipe.mealType,
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fat: recipe.fat,
            fiber: recipe.fiber,
            sugar: recipe.sugar,
            sodium: recipe.sodium,
            ingredients: JSON.stringify(recipe.ingredients),
            instructions: JSON.stringify(recipe.instructions),
            tags: JSON.stringify(recipe.tags),
            authorId: demoUser.id
          }
        });
        successCount++;
        console.log(`✅ Saved: ${recipe.title}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error saving ${recipe.title}:`, error);
      }
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`✅ Successfully saved: ${successCount} recipes`);
    console.log(`❌ Errors: ${errorCount} recipes`);
    console.log(`📈 Success rate: ${((successCount / allRecipes.length) * 100).toFixed(1)}%`);

    // Create some sample saved recipes and likes
    console.log('\n🎯 Creating sample user interactions...');
    
    // Get first 5 recipes to save
    const recipesToSave = await prisma.recipe.findMany({
      take: 5,
      select: { id: true }
    });

    for (const recipe of recipesToSave) {
      await prisma.savedRecipe.create({
        data: {
          userId: demoUser.id,
          recipeId: recipe.id
        }
      });
    }

    console.log(`❤️ Created ${recipesToSave.length} saved recipes for demo user`);

    // Create some likes
    const recipesToLike = await prisma.recipe.findMany({
      take: 8,
      select: { id: true }
    });

    for (const recipe of recipesToLike) {
      await prisma.like.create({
        data: {
          userId: demoUser.id,
          recipeId: recipe.id
        }
      });
    }

    console.log(`👍 Created ${recipesToLike.length} likes for demo user`);

    console.log('\n🎉 Database seeded successfully with REAL API data!');
    console.log(`\n📋 Quick Stats:`);
    console.log(`👥 Users: 1`);
    console.log(`🍽️ Recipes: ${successCount}`);
    console.log(`💾 Saved Recipes: ${recipesToSave.length}`);
    console.log(`❤️ Likes: ${recipesToLike.length}`);
    
    console.log(`\n🔑 Demo Login Credentials:`);
    console.log(`Email: demo@cookease.com`);
    console.log(`Password: password123`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    console.log('\n⚠️ Falling back to basic recipes...');
    
    // Fallback: Create some basic recipes if API fails
    const fallbackRecipes = [
      {
        title: "Classic Butter Chicken",
        description: "Creamy, rich Indian curry with tender chicken in a tomato-based sauce",
        image: "/images/dishes/butter-chicken.jpg",
        cookTime: 45,
        servings: 4,
        difficulty: "medium",
        cuisine: "indian",
        mealType: "dinner",
        calories: 520,
        protein: 32,
        carbs: 12,
        fat: 38,
        ingredients: JSON.stringify([
          { name: "Chicken breast", amount: "1 lb" },
          { name: "Heavy cream", amount: "1 cup" },
          { name: "Tomato sauce", amount: "1 cup" },
          { name: "Butter", amount: "4 tbsp" },
          { name: "Garam masala", amount: "2 tsp" }
        ]),
        instructions: JSON.stringify([
          "Marinate chicken in yogurt and spices",
          "Cook chicken until golden",
          "Simmer in tomato cream sauce",
          "Serve with rice or naan"
        ]),
        tags: JSON.stringify(["indian", "chicken", "creamy", "popular"])
      },
      {
        title: "Vegetable Biryani",
        description: "Aromatic basmati rice with mixed vegetables and traditional spices",
        image: "/images/dishes/vegetable-biryani.jpg",
        cookTime: 60,
        servings: 6,
        difficulty: "medium",
        cuisine: "indian",
        mealType: "lunch",
        calories: 380,
        protein: 12,
        carbs: 58,
        fat: 14,
        ingredients: JSON.stringify([
          { name: "Basmati rice", amount: "2 cups" },
          { name: "Mixed vegetables", amount: "3 cups" },
          { name: "Onions", amount: "2 large" },
          { name: "Biryani spices", amount: "2 tbsp" },
          { name: "Saffron", amount: "1 pinch" }
        ]),
        instructions: JSON.stringify([
          "Soak rice for 30 minutes",
          "Fry onions until golden",
          "Layer rice and vegetables",
          "Cook on low heat for 45 minutes"
        ]),
        tags: JSON.stringify(["indian", "vegetarian", "rice", "aromatic"])
      }
    ];

    for (const recipe of fallbackRecipes) {
      await prisma.recipe.create({
        data: {
          ...recipe,
          authorId: demoUser.id
        }
      });
    }

    console.log(`✅ Created ${fallbackRecipes.length} fallback recipes`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 