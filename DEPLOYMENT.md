# 🚀 FoodToday Deployment Guide

## 📋 **Pre-Deployment Checklist**

### 1. **Database Migration (IMPORTANT!)**
Your app currently uses SQLite (local file). For production, you need a cloud database.

**Option A: Supabase (Recommended - Free)**
- Go to [supabase.com](https://supabase.com)
- Create free account
- Create new project
- Get your database URL
- Update `DATABASE_URL` in Vercel environment variables

**Option B: PlanetScale (Free)**
- Go to [planetscale.com](https://planetscale.com)
- Create free account
- Create new database
- Get your database URL

### 2. **Environment Variables**
You'll need these API keys (all free):

**Pexels API (Images):**
- Go to [pexels.com/api](https://pexels.com/api)
- Sign up for free account
- Get your API key

**Unsplash API (Images):**
- Go to [unsplash.com/developers](https://unsplash.com/developers)
- Create free account
- Get your API key

**Spoonacular API (Nutrition):**
- Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
- Sign up for free account
- Get your API key

### 3. **JWT Secret**
Generate a random string for JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 **Deployment Steps**

### Step 1: Prepare Your Code
1. **Update package.json name:**
   ```json
   {
     "name": "foodtoday",
     "version": "1.0.0"
   }
   ```

2. **Test build locally:**
   ```bash
   npm run build
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project? → No
   - Project name: → foodtoday
   - Directory: → ./
   - Override settings? → No

### Step 3: Configure Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add these variables:

   ```
   DATABASE_URL=your-cloud-database-url
   JWT_SECRET=your-generated-jwt-secret
   PEXELS_API_KEY=your-pexels-api-key
   UNSPLASH_API_KEY=your-unsplash-api-key
   SPOONACULAR_API_KEY=your-spoonacular-api-key
   ```

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Step 4: Database Setup

1. **Update Prisma Schema for Production:**
   ```prisma
   datasource db {
     provider = "postgresql" // or "mysql" for PlanetScale
     url      = env("DATABASE_URL")
   }
   ```

2. **Push Schema to Production:**
   ```bash
   npx prisma db push
   ```

3. **Seed Production Database:**
   ```bash
   npm run seed-real
   ```

## 🔧 **Post-Deployment**

### 1. **Test Your App**
- Visit your Vercel URL
- Test login/signup
- Test recipe search
- Test multi-language feature

### 2. **Custom Domain (Optional)**
- Go to Vercel Dashboard → Domains
- Add your custom domain
- Update DNS settings

### 3. **Monitor Performance**
- Vercel provides analytics
- Monitor API usage
- Check error logs

## 📊 **Scaling Considerations**

### Free Tier Limits:
- **Vercel:** 100GB bandwidth/month
- **Supabase:** 500MB database, 50MB file storage
- **PlanetScale:** 1GB database, 1 billion reads/month

### When to Upgrade:
- User base > 1000 active users
- Database > 500MB
- Bandwidth > 100GB/month

## 🛠️ **Troubleshooting**

### Common Issues:

1. **Build Fails:**
   - Check environment variables
   - Ensure all dependencies are in package.json
   - Check for TypeScript errors

2. **Database Connection:**
   - Verify DATABASE_URL is correct
   - Check database is accessible
   - Ensure schema is pushed

3. **API Errors:**
   - Verify API keys are correct
   - Check API rate limits
   - Monitor API usage

## 📱 **Mobile App (Future)**

For mobile deployment:
- **Expo:** Convert to React Native
- **PWA:** Already configured for mobile
- **Capacitor:** Convert to native app

## 🔄 **Updates & Maintenance**

### Regular Updates:
1. **Dependencies:** `npm update`
2. **Security:** Monitor for vulnerabilities
3. **Features:** Deploy new features via Vercel

### Backup Strategy:
1. **Database:** Regular backups
2. **Code:** GitHub repository
3. **Environment:** Document all variables

---

## 🎯 **Next Steps After Deployment**

1. **Analytics:** Add Google Analytics
2. **SEO:** Optimize meta tags
3. **Performance:** Monitor Core Web Vitals
4. **User Feedback:** Add feedback system
5. **Monetization:** Consider premium features

---

**Need Help?** Check Vercel documentation or contact support! 