# 🚀 API Setup Guide for Cook-Ease

This guide will help you set up all the **FREE** APIs to get real recipe data, nutrition information, and high-quality images for your Cook-Ease application.

## 🔑 Required API Keys (All Free!)

### 1. **TheMealDB** - ✅ **NO API KEY NEEDED**
- **Cost**: Completely FREE
- **Features**: Recipe data, ingredients, instructions
- **Specialties**: Great Indian, Italian, Mexican, Chinese recipes
- **Setup**: Nothing to do! Already integrated.

### 2. **Spoonacular API** - 🆓 **FREE TIER**
- **Cost**: FREE (150 requests/day)
- **Features**: Detailed nutrition data, recipe search
- **Sign up**: https://spoonacular.com/food-api
- **Steps**:
  1. Go to https://spoonacular.com/food-api
  2. Click "Get Started"
  3. Create account (free)
  4. Go to "My Console" 
  5. Copy your API key
  6. Add to `.env` file: `SPOONACULAR_API_KEY=your_key_here`

### 3. **Unsplash API** - 🆓 **FREE TIER**
- **Cost**: FREE (50 requests/hour)
- **Features**: High-quality food images
- **Sign up**: https://unsplash.com/developers
- **Steps**:
  1. Go to https://unsplash.com/developers
  2. Click "Register as a developer"
  3. Create account
  4. Click "New Application"
  5. Accept terms and create app
  6. Copy "Access Key"
  7. Add to `.env` file: `UNSPLASH_ACCESS_KEY=your_key_here`

### 4. **Pexels API** - 🆓 **FREE TIER**
- **Cost**: FREE (200 requests/hour)
- **Features**: High-quality food images (backup)
- **Sign up**: https://www.pexels.com/api/
- **Steps**:
  1. Go to https://www.pexels.com/api/
  2. Click "Get Started"
  3. Create account
  4. Go to "Your API Key" 
  5. Copy your API key
  6. Add to `.env` file: `PEXELS_API_KEY=your_key_here`

## 📝 Environment Variables Setup

Create a `.env` file in your `cook-ease` directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"

# API Keys
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
PEXELS_API_KEY=your_pexels_api_key_here

# Note: TheMealDB doesn't require an API key
```

## 🎯 Quick Setup Steps

### **Step 1: Get API Keys (15 minutes)**
1. **Spoonacular**: Sign up → Get API key → Add to `.env`
2. **Unsplash**: Sign up → Create app → Get Access Key → Add to `.env`
3. **Pexels**: Sign up → Get API key → Add to `.env`

### **Step 2: Install Dependencies**
```bash
cd cook-ease
npm install
```

### **Step 3: Seed Database with Real Data**
```bash
# Run the real data seeding
npm run seed-real
```

This will:
- ✅ Fetch ~50 real recipes from multiple cuisines
- ✅ Get high-quality images for each recipe
- ✅ Calculate proper nutrition data
- ✅ Create sample user interactions

### **Step 4: Start the Application**
```bash
npm run dev
```

## 🍽️ What You'll Get

### **Recipes**:
- 🇮🇳 **15 Indian recipes** (Butter Chicken, Biryani, Curry, etc.)
- 🇮🇹 **10 Italian recipes** (Pasta, Pizza, Risotto, etc.)
- 🇲🇽 **10 Mexican recipes** (Tacos, Burritos, Quesadillas, etc.)
- 🇨🇳 **8 Chinese recipes** (Fried Rice, Noodles, etc.)
- 🌍 **7 International recipes** (Various cuisines)

### **Data Quality**:
- ✅ **Real ingredients** with proper measurements
- ✅ **Step-by-step instructions** from real chefs
- ✅ **Accurate nutrition data** (calories, protein, carbs, fat)
- ✅ **High-quality images** from professional photographers
- ✅ **Proper difficulty levels** and cook times

### **Features**:
- ✅ **Advanced search** by cuisine, ingredients, nutrition
- ✅ **Personalized recommendations** based on dietary preferences
- ✅ **Save recipes** to your library
- ✅ **Shopping list generation** with real ingredients
- ✅ **Social features** (likes, comments, ratings)

## 🔧 Troubleshooting

### **Issue**: API not working
**Solution**: Check your `.env` file and make sure:
- No spaces around the `=` sign
- API keys are correct
- File is in the right location (`cook-ease/.env`)

### **Issue**: Low API limits
**Solution**: The app is smart about API usage:
- Uses **TheMealDB** (unlimited) as primary source
- Uses **Spoonacular** only for enhanced nutrition
- Uses **Unsplash/Pexels** for better images
- Caches data to avoid repeated calls

### **Issue**: Some recipes missing images
**Solution**: This is normal! The app will:
- Try **Unsplash** first
- Fallback to **Pexels**
- Use **default placeholder** if both fail

## 📊 API Usage Limits

| API | Free Limit | Usage |
|-----|------------|-------|
| **TheMealDB** | ♾️ Unlimited | Primary recipe source |
| **Spoonacular** | 150/day | Nutrition enhancement |
| **Unsplash** | 50/hour | Food images |
| **Pexels** | 200/hour | Backup images |

## 🎉 Expected Results

After running `npm run seed-real`, you should see:
```
🇮🇳 Fetched 15 Indian recipes
🇮🇹 Fetched 10 Italian recipes  
🇲🇽 Fetched 10 Mexican recipes
🇨🇳 Fetched 8 Chinese recipes
🌍 Fetched 7 international recipes
✅ Successfully saved: 50 recipes
📈 Success rate: 100%
```

## 💡 Pro Tips

1. **Start with TheMealDB only**: Even without other API keys, you'll get great recipes
2. **Add Unsplash for better images**: Makes your app look professional
3. **Add Spoonacular for nutrition**: Enhances user experience
4. **Monitor your usage**: Check API dashboards occasionally

## 🎯 Next Steps

After setup:
1. **Test the app**: Create account and browse recipes
2. **Customize preferences**: Update dietary restrictions
3. **Save recipes**: Build your library
4. **Generate shopping lists**: Test the full workflow

---

**🚀 Ready to launch your Cook-Ease app with real-world data!** 