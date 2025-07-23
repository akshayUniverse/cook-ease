# 🚀 **Vercel Deployment Troubleshooting Guide**

## ✅ **Dependency Conflict - FIXED**

### **Problem:**
```
npm error ERESOLVE could not resolve
npm error peer @typescript-eslint/parser@"^6.0.0 || ^6.0.0-alpha" from @typescript-eslint/eslint-plugin@7.0.0
```

### **Solution Applied:**
1. **Fixed package.json:** Downgraded `@typescript-eslint/parser` from `^7.0.0` to `^6.21.0`
2. **Added .npmrc:** Configured peer dependency handling
3. **Verified ESLint config:** Ensured compatibility

## 🔧 **Files Updated:**

### **1. package.json**
```json
"@typescript-eslint/parser": "^6.21.0"  // Changed from "^7.0.0"
```

### **2. .npmrc (New File)**
```
legacy-peer-deps=true
strict-peer-dependencies=false
auto-install-peers=true
```

## 🚀 **Deployment Steps (Updated)**

### **Step 1: Commit Changes**
```bash
git add .
git commit -m "Fix ESLint dependency conflicts for Vercel deployment"
git push origin main
```

### **Step 2: Deploy to Vercel**
```bash
# Option 1: Deploy with unique name
vercel --name foodtoday-app --yes

# Option 2: Deploy to production
vercel --prod --name foodtoday-app

# Option 3: Deploy via GitHub (Recommended)
# Just push to GitHub and Vercel will auto-deploy
```

### **Step 3: Monitor Build**
- Go to Vercel dashboard
- Check build logs for any remaining issues
- Verify successful deployment

## 🔍 **Alternative Solutions (If Issues Persist)**

### **Option 1: Force Install**
```bash
# Add to package.json scripts
"vercel-build": "npm install --legacy-peer-deps && npm run build"
```

### **Option 2: Update vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "installCommand": "npm install --legacy-peer-deps"
      }
    }
  ]
}
```

### **Option 3: Remove ESLint from Build**
```json
// In package.json, change build script
"build": "DISABLE_ESLINT_PLUGIN=true next build"
```

## 📋 **Environment Variables (Required)**

Add these in Vercel dashboard:

```
DATABASE_URL=your-cloud-database-url
JWT_SECRET=your-generated-jwt-secret
NODE_ENV=production
```

## 🎯 **Quick Fix Commands**

```bash
# Test locally first
npm install --legacy-peer-deps
npm run build

# If successful, deploy
vercel --name foodtoday-app --yes
```

## 🔄 **If Build Still Fails**

### **Check Build Logs:**
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on failed deployment
5. Check "Build Logs" for specific errors

### **Common Issues & Solutions:**

1. **Memory Issues:**
   ```json
   // In vercel.json
   "functions": {
     "pages/api/**/*.ts": {
       "memory": 2048,
       "maxDuration": 60
     }
   }
   ```

2. **Node Version:**
   ```json
   // In package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. **Build Timeout:**
   ```json
   // In vercel.json
   "functions": {
     "pages/api/**/*.ts": {
       "maxDuration": 60
     }
   }
   ```

## ✅ **Success Indicators**

- ✅ Build completes without errors
- ✅ All dependencies install successfully
- ✅ Next.js build passes
- ✅ App deploys to `https://your-app.vercel.app`

## 🆘 **Emergency Fallback**

If all else fails, create a minimal deployment:

```bash
# Create minimal package.json for deployment
npm init -y
npm install next react react-dom
npm install --save-dev typescript @types/react @types/node

# Deploy minimal version
vercel --name foodtoday-minimal
```

---

**Try deploying now with the fixed dependencies!** 🚀 