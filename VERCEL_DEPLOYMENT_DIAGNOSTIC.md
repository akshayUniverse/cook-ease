# 🔍 **Vercel Deployment Diagnostic Guide**

## 🚨 **Current Issues Identified**

### **1. 405 Method Not Allowed Error**
```
POST https://aajkakhana-sandy.vercel.app/api/auth/login 405 (Method Not Allowed)
```

### **2. Database Connection Issues**
- Local: SQLite (`file:./prisma/dev.db`) ✅ Works
- Production: PostgreSQL (`postgresql://postgres:#Rajkguhasamq.supabase.co:5432/postgres`) ❌ Issues

### **3. Environment Variables**
- JWT_SECRET might not be configured properly
- DATABASE_URL might have connection issues

## 🔧 **Step-by-Step Diagnostic Process**

### **Step 1: Test Basic API Functionality**

#### **Test CORS and Basic API**
```bash
# Test this URL in browser or Postman
GET https://aajkakhana-sandy.vercel.app/api/test-cors
```

**Expected Response:**
```json
{
  "message": "CORS test successful",
  "method": "GET",
  "timestamp": "2025-07-26T...",
  "environment": "production",
  "databaseUrl": "Configured"
}
```

#### **Test Database Connection**
```bash
# Test this URL in browser or Postman
GET https://aajkakhana-sandy.vercel.app/api/test-database
```

**Expected Response:**
```json
{
  "message": "Database connection successful",
  "databaseTest": [{"test": 1}],
  "userCount": 0,
  "databaseUrl": "Configured",
  "environment": "production"
}
```

#### **Test Simple Login (No Database)**
```bash
# Test this with POST request
POST https://aajkakhana-sandy.vercel.app/api/test-login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

**Expected Response:**
```json
{
  "message": "Test login successful",
  "user": {...},
  "token": "test-jwt-token",
  "jwtSecret": "Configured"
}
```

### **Step 2: Check Environment Variables**

#### **In Vercel Dashboard:**
1. Go to your project in Vercel
2. Click on "Settings" → "Environment Variables"
3. Verify these variables are set:

```
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### **Test Environment Variables**
```bash
# Test this URL
GET https://aajkakhana-sandy.vercel.app/api/test-env
```

### **Step 3: Database Setup**

#### **Check if Database is Migrated**
```bash
# Test this URL
GET https://aajkakhana-sandy.vercel.app/api/setup-database
```

#### **Manual Database Setup (if needed)**
1. Connect to your Supabase database
2. Run these commands:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if users table exists
SELECT * FROM users LIMIT 1;
```

### **Step 4: Fix Database Connection**

#### **If Database Connection Fails:**

1. **Check Supabase Connection String:**
   ```
   postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
   ```

2. **Verify Supabase Settings:**
   - Go to Supabase Dashboard
   - Check "Database" → "Connection string"
   - Ensure password is correct
   - Check if IP restrictions are enabled

3. **Test Connection:**
   ```bash
   # Use psql or any PostgreSQL client
   psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
   ```

### **Step 5: Fix JWT Secret**

#### **Generate New JWT Secret:**
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **Update in Vercel:**
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update `JWT_SECRET` with the new value
4. Redeploy the application

## 🎯 **Common Issues and Solutions**

### **Issue 1: 405 Method Not Allowed**
**Cause:** CORS middleware not working properly
**Solution:** 
- ✅ Already fixed with updated CORS middleware
- ✅ Added test endpoints to verify

### **Issue 2: Database Connection Failed**
**Cause:** Wrong connection string or credentials
**Solution:**
1. Verify Supabase connection string
2. Check password in connection string
3. Ensure database exists and is accessible

### **Issue 3: JWT Secret Issues**
**Cause:** Missing or incorrect JWT_SECRET
**Solution:**
1. Generate new JWT secret
2. Update in Vercel environment variables
3. Redeploy application

### **Issue 4: Environment Variables Not Loading**
**Cause:** Variables not set in Vercel
**Solution:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure variables are set for "Production" environment
3. Redeploy after adding variables

## 🚀 **Deployment Checklist**

### **Before Deploying:**
- [ ] Environment variables set in Vercel
- [ ] Database connection string verified
- [ ] JWT secret generated and set
- [ ] Database migrated and seeded
- [ ] All test endpoints working locally

### **After Deploying:**
- [ ] Test `/api/test-cors` endpoint
- [ ] Test `/api/test-database` endpoint
- [ ] Test `/api/test-login` endpoint
- [ ] Test actual login functionality
- [ ] Verify all features work

## 🔍 **Debugging Commands**

### **Check Vercel Logs:**
```bash
# In Vercel Dashboard → Functions → View Function Logs
# Look for errors in API routes
```

### **Test Local vs Production:**
```bash
# Local test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Production test
curl -X POST https://aajkakhana-sandy.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📞 **Next Steps**

1. **Deploy the current changes:**
   ```bash
   git add .
   git commit -m "Add diagnostic endpoints and fix CORS issues"
   git push origin main
   ```

2. **Test the diagnostic endpoints:**
   - `/api/test-cors`
   - `/api/test-database`
   - `/api/test-login`

3. **Check Vercel environment variables**

4. **Verify database connection**

5. **Test actual login functionality**

## 🎯 **Expected Results**

After fixing all issues:
- ✅ All test endpoints return 200 status
- ✅ Database connection successful
- ✅ Login functionality works
- ✅ No more 405 errors
- ✅ Application works on any device

---

**🔧 Follow this diagnostic guide step by step to identify and fix the deployment issues!** 