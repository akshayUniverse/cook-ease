# 🔧 **Environment Variables Setup Guide**

## 🚨 **CRITICAL: Set These Environment Variables in Vercel**

Your app is failing because these environment variables are missing. Follow these steps:

### **Step 1: Go to Vercel Dashboard**
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Click on your project (`aajkakhana-sandy`)

### **Step 2: Add Environment Variables**
1. Go to **Settings** tab
2. Click on **Environment Variables**
3. Add each variable below:

## 📋 **Required Environment Variables**

### **1. JWT_SECRET (CRITICAL)**
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-in-production
Environment: Production, Preview, Development
```

### **2. DATABASE_URL (CRITICAL)**
```
Name: DATABASE_URL
Value: your-postgresql-database-url
Environment: Production, Preview, Development
```

**If you don't have a database:**
- Use [Neon](https://neon.tech) (free PostgreSQL)
- Or [Supabase](https://supabase.com) (free PostgreSQL)
- Or [Railway](https://railway.app) (free PostgreSQL)

### **3. NEXTAUTH_SECRET (Optional - Fallback)**
```
Name: NEXTAUTH_SECRET
Value: your-super-secret-jwt-key-change-this-in-production
Environment: Production, Preview, Development
```

### **4. NODE_ENV**
```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

## 🔑 **Generate a Secure JWT Secret**

### **Option 1: Use Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Option 2: Use Online Generator**
Visit: https://generate-secret.vercel.app/64

### **Option 3: Use This (for testing only)**
```
your-super-secret-jwt-key-change-this-in-production-please-change-in-production
```

## 🗄️ **Database Setup**

### **Option 1: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string
5. Format: `postgresql://username:password@host:port/database`

### **Option 2: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create free account
3. Create new project
4. Go to Settings > Database
5. Copy connection string

### **Option 3: Railway**
1. Go to [railway.app](https://railway.app)
2. Create free account
3. Create new PostgreSQL service
4. Copy connection string

## 🔄 **After Adding Environment Variables**

### **Step 1: Redeploy**
1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Or push new commit to trigger auto-deploy

### **Step 2: Test Login**
1. Visit your app: `https://aajkakhana-sandy.vercel.app`
2. Try to login with existing account
3. Check browser console for errors

## 🐛 **Troubleshooting**

### **Error: "Method Not Allowed"**
- ✅ Environment variables are set correctly
- ✅ JWT_SECRET is configured
- ✅ Database is connected

### **Error: "Database Connection Failed"**
- ❌ DATABASE_URL is missing or incorrect
- ❌ Database is not accessible
- ❌ Database credentials are wrong

### **Error: "JWT Verification Failed"**
- ❌ JWT_SECRET is missing
- ❌ JWT_SECRET doesn't match between login and verification

## 📝 **Complete Environment Variables List**

```bash
# Required for Authentication
JWT_SECRET=your-generated-secret-key
NEXTAUTH_SECRET=your-generated-secret-key

# Required for Database
DATABASE_URL=postgresql://username:password@host:port/database

# Required for Production
NODE_ENV=production

# Optional for External APIs (if you add them later)
SPOONACULAR_API_KEY=your-api-key
THEMEALDB_API_KEY=your-api-key
```

## 🎯 **Quick Setup Commands**

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test database connection locally
npm run dev

# Deploy with environment variables
vercel --prod
```

## ✅ **Verification Checklist**

- [ ] JWT_SECRET is set in Vercel
- [ ] DATABASE_URL is set in Vercel
- [ ] NODE_ENV is set to "production"
- [ ] Database is accessible from Vercel
- [ ] App redeploys successfully
- [ ] Login works without errors
- [ ] No "Method Not Allowed" errors
- [ ] No "JWT Verification Failed" errors

---

**🚀 After setting these environment variables, your login should work!** 