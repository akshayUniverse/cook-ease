# 🏗️ FoodToday Project Architecture Guide

## 📁 **Project Structure Overview**

```
cook-ease/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   ├── onboarding/     # Onboarding flow components
│   └── recipe/         # Recipe-specific components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Next.js pages and API routes
│   ├── api/           # Backend API endpoints
│   └── [pages].tsx    # Frontend pages
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── styles/            # CSS and styling
├── utils/             # Utility functions
└── tests/             # Test files
```

## 🔧 **Technology Stack**

### **Frontend:**
- **Next.js 14** - React framework with SSR/SSG
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### **Backend:**
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database operations
- **SQLite** (dev) / **PostgreSQL** (prod) - Database
- **JWT** - Authentication

### **External APIs:**
- **TheMealDB** - Recipe data
- **Spoonacular** - Nutrition information
- **Pexels/Unsplash** - High-quality images

### **Deployment:**
- **Vercel** - Hosting platform
- **Supabase/PlanetScale** - Cloud database

## 🧩 **Core Components Explained**

### 1. **Authentication System**
**Files:** `hooks/useAuth.ts`, `pages/api/auth/`, `contexts/AuthContext.tsx`

**How it works:**
- JWT-based authentication
- User sessions stored in localStorage
- Protected routes with `useRequireAuth` hook
- Login/signup with email/password

**To update:**
```typescript
// Add new auth method
// Edit: hooks/useAuth.ts
export const useAuth = () => {
  // Add your new auth logic here
}
```

### 2. **Database Schema**
**File:** `prisma/schema.prisma`

**Key Models:**
- `User` - User accounts and preferences
- `Recipe` - Recipe data with nutrition info
- `SavedRecipe` - User's saved recipes
- `Like` - Recipe likes
- `Comment` - Recipe comments
- `ShoppingList` - User's shopping lists

**To update:**
```bash
# Add new field to model
# Edit: prisma/schema.prisma
# Then run:
npx prisma db push
npx prisma generate
```

### 3. **Multi-Language System**
**Files:** `contexts/TranslationContext.tsx`, `components/common/LanguageSelector.tsx`

**How it works:**
- React Context for language state
- Translation keys for UI elements
- Persistent language choice in localStorage
- Support for English and Hindi

**To add new language:**
```typescript
// Edit: contexts/TranslationContext.tsx
const translations = {
  en: { /* English */ },
  hi: { /* Hindi */ },
  es: { /* Spanish - NEW */ }  // Add here
}
```

### 4. **Recipe Engine**
**Files:** `utils/recipeEngine.ts`, `utils/realTimeApiSearch.ts`

**Features:**
- Personalized recipe suggestions
- Ingredient-based search
- Dietary preference filtering
- External API integration

**To update:**
```typescript
// Add new recipe source
// Edit: utils/realTimeApiSearch.ts
export const searchNewAPI = async (query: string) => {
  // Your new API integration
}
```

### 5. **PWA (Progressive Web App)**
**Files:** `public/sw.js`, `public/manifest.json`, `utils/pwa.ts`

**Features:**
- Offline functionality
- App-like experience
- Push notifications (future)
- Install prompt

**To update:**
```javascript
// Edit: public/sw.js
// Add new caching strategies
// Update service worker logic
```

## 🔄 **Data Flow**

### 1. **User Authentication Flow:**
```
User Input → API Route → Database → JWT Token → LocalStorage → Protected Routes
```

### 2. **Recipe Search Flow:**
```
User Query → API Route → Local DB → External APIs → Filter Results → Return Data
```

### 3. **Multi-Language Flow:**
```
Language Selection → Context Update → UI Re-render → Persistent Storage
```

## 🎨 **UI/UX Components**

### 1. **Layout Components**
- **Header** (`components/layout/Header.tsx`) - Top navigation with language selector
- **BottomNav** (`components/layout/BottomNav.tsx`) - Mobile bottom navigation
- **MainLayout** (`components/layout/MainLayout.tsx`) - Page wrapper

### 2. **Recipe Components**
- **RecipeCard** (`components/recipe/RecipeCard.tsx`) - Recipe display card
- **MealTabs** (`components/recipe/MealTabs.tsx`) - Meal type filters
- **NutritionBadge** (`components/recipe/NutritionBadge.tsx`) - Nutrition info

### 3. **Common Components**
- **SearchBar** (`components/common/SearchBar.tsx`) - Search functionality
- **StarRating** (`components/common/StarRating.tsx`) - Rating display
- **SuccessNotification** (`components/common/SuccessNotification.tsx`) - User feedback

## 🔧 **How to Update Different Parts**

### **Adding New Features:**

1. **New Page:**
   ```bash
   # Create: pages/new-feature.tsx
   # Add route to navigation
   # Update types if needed
   ```

2. **New API Endpoint:**
   ```bash
   # Create: pages/api/new-feature.ts
   # Add proper error handling
   # Test with Postman/Thunder Client
   ```

3. **New Database Model:**
   ```bash
   # Edit: prisma/schema.prisma
   # Run: npx prisma db push
   # Run: npx prisma generate
   ```

4. **New Component:**
   ```bash
   # Create: components/feature/NewComponent.tsx
   # Add TypeScript interfaces
   # Import and use in pages
   ```

### **Styling Updates:**
```css
/* Edit: styles/globals.css for global styles */
/* Edit: component files for component-specific styles */
/* Use Tailwind classes for utility styling */
```

### **Configuration Updates:**
```javascript
// Edit: next.config.js for Next.js config
// Edit: tailwind.config.js for Tailwind config
// Edit: tsconfig.json for TypeScript config
```

## 🚀 **Performance Optimizations**

### **Current Optimizations:**
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Automatic with Next.js
- **Caching** - Service worker for static assets
- **Lazy Loading** - Images and components

### **Future Optimizations:**
- **Database Indexing** - For faster queries
- **CDN** - For global content delivery
- **Redis Caching** - For frequently accessed data
- **GraphQL** - For efficient data fetching

## 🔒 **Security Features**

### **Current Security:**
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Zod schema validation
- **CORS Protection** - API route protection

### **Future Security:**
- **Rate Limiting** - Prevent API abuse
- **Input Sanitization** - XSS protection
- **HTTPS Only** - Secure connections
- **Security Headers** - Additional protection

## 📊 **Monitoring & Analytics**

### **Current Monitoring:**
- **Vercel Analytics** - Built-in performance monitoring
- **Console Logging** - Development debugging
- **Error Boundaries** - React error catching

### **Future Monitoring:**
- **Google Analytics** - User behavior tracking
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Custom Metrics** - Business KPIs

## 🔄 **Deployment Pipeline**

### **Development:**
```bash
npm run dev          # Local development
npm run build        # Test build
npm run lint         # Code quality check
```

### **Production:**
```bash
vercel --prod        # Deploy to production
npx prisma db push   # Update database schema
npm run seed-real    # Seed production data
```

## 🎯 **Scaling Strategy**

### **Current Architecture:**
- **Serverless Functions** - Auto-scaling with Vercel
- **Cloud Database** - Scalable database solution
- **CDN** - Fast content delivery
- **PWA** - Reduced server load

### **Future Scaling:**
- **Microservices** - Break into smaller services
- **Load Balancing** - Distribute traffic
- **Database Sharding** - Split data across databases
- **Caching Layer** - Redis for performance

---

## 📚 **Learning Resources**

### **Technologies Used:**
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://typescriptlang.org/docs)

### **Best Practices:**
- [React Best Practices](https://react.dev/learn)
- [Next.js Best Practices](https://nextjs.org/docs/basic-features)
- [Database Design](https://prisma.io/docs/concepts)

---

**Need to understand something specific?** Check the relevant file or ask for detailed explanation! 