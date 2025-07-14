// Offline Storage and Management Utility
export interface OfflineRecipe {
  id: string;
  title: string;
  description: string;
  image: string;
  ingredients: any[];
  instructions: string[];
  cookTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  rating: number;
  author: {
    name: string;
    id: string;
  };
  cachedAt: number;
  lastViewed: number;
  isFavorite: boolean;
}

export interface OfflineSearchHistory {
  id: string;
  query: string;
  filters: any;
  timestamp: number;
  results: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private dbName = 'CookEaseOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create recipes store
        if (!db.objectStoreNames.contains('recipes')) {
          const recipesStore = db.createObjectStore('recipes', { keyPath: 'id' });
          recipesStore.createIndex('title', 'title', { unique: false });
          recipesStore.createIndex('cuisine', 'cuisine', { unique: false });
          recipesStore.createIndex('mealType', 'mealType', { unique: false });
          recipesStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          recipesStore.createIndex('lastViewed', 'lastViewed', { unique: false });
          recipesStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Create search history store
        if (!db.objectStoreNames.contains('searchHistory')) {
          const searchStore = db.createObjectStore('searchHistory', { keyPath: 'id' });
          searchStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create user preferences store
        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }

        // Create offline queue store
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  // Cache recipe for offline access
  public async cacheRecipe(recipe: any): Promise<void> {
    if (!this.db) await this.initDB();

    const offlineRecipe: OfflineRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      mealType: recipe.mealType,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      tags: recipe.tags,
      rating: recipe.rating,
      author: recipe.author,
      cachedAt: Date.now(),
      lastViewed: Date.now(),
      isFavorite: recipe.isFavorite || false
    };

    return this.saveToStore('recipes', offlineRecipe);
  }

  // Get cached recipe
  public async getCachedRecipe(id: string): Promise<OfflineRecipe | null> {
    if (!this.db) await this.initDB();
    
    const recipe = await this.getFromStore('recipes', id);
    if (recipe) {
      // Update last viewed timestamp
      recipe.lastViewed = Date.now();
      await this.saveToStore('recipes', recipe);
    }
    
    return recipe;
  }

  // Get all cached recipes
  public async getCachedRecipes(filters?: {
    cuisine?: string;
    mealType?: string;
    isFavorite?: boolean;
    limit?: number;
  }): Promise<OfflineRecipe[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recipes'], 'readonly');
      const store = transaction.objectStore('recipes');
      const request = store.getAll();

      request.onsuccess = () => {
        let recipes = request.result as OfflineRecipe[];

        // Apply filters
        if (filters) {
          if (filters.cuisine) {
            recipes = recipes.filter(r => r.cuisine.toLowerCase() === filters.cuisine!.toLowerCase());
          }
          if (filters.mealType) {
            recipes = recipes.filter(r => r.mealType.toLowerCase() === filters.mealType!.toLowerCase());
          }
          if (filters.isFavorite !== undefined) {
            recipes = recipes.filter(r => r.isFavorite === filters.isFavorite);
          }
        }

        // Sort by last viewed (most recent first)
        recipes.sort((a, b) => b.lastViewed - a.lastViewed);

        // Apply limit
        if (filters?.limit) {
          recipes = recipes.slice(0, filters.limit);
        }

        resolve(recipes);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Search cached recipes
  public async searchCachedRecipes(query: string): Promise<OfflineRecipe[]> {
    const allRecipes = await this.getCachedRecipes();
    
    if (!query.trim()) return allRecipes;

    const lowerQuery = query.toLowerCase();
    return allRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.cuisine.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(lowerQuery))
    );
  }

  // Save search history
  public async saveSearchHistory(query: string, filters: any, results: number): Promise<void> {
    if (!this.db) await this.initDB();

    const searchItem: OfflineSearchHistory = {
      id: Date.now().toString(),
      query,
      filters,
      timestamp: Date.now(),
      results
    };

    await this.saveToStore('searchHistory', searchItem);
    await this.cleanupOldSearchHistory();
  }

  // Get search history
  public async getSearchHistory(limit: number = 10): Promise<OfflineSearchHistory[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchHistory'], 'readonly');
      const store = transaction.objectStore('searchHistory');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const results: OfflineSearchHistory[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Add to offline queue
  public async addToOfflineQueue(action: {
    type: 'save' | 'like' | 'comment' | 'add-recipe';
    recipeId: string;
    data: any;
  }): Promise<void> {
    if (!this.db) await this.initDB();

    const queueItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...action
    };

    await this.saveToStore('offlineQueue', queueItem);
  }

  // Process offline queue when back online
  public async processOfflineQueue(): Promise<void> {
    if (!this.db) await this.initDB();

    const queueItems = await this.getAllFromStore('offlineQueue');
    
    for (const item of queueItems) {
      try {
        await this.processQueueItem(item);
        await this.deleteFromStore('offlineQueue', item.id);
      } catch (error) {
        console.error('Failed to process queue item:', error);
      }
    }
  }

  // Process individual queue item
  private async processQueueItem(item: any): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    switch (item.type) {
      case 'save':
        await fetch(`/api/recipes/${item.recipeId}/save`, {
          method: 'POST',
          headers
        });
        break;
      
      case 'like':
        await fetch(`/api/recipes/${item.recipeId}/like`, {
          method: 'POST',
          headers
        });
        break;
      
      case 'comment':
        await fetch(`/api/recipes/${item.recipeId}/comments`, {
          method: 'POST',
          headers,
          body: JSON.stringify(item.data)
        });
        break;
      
      case 'add-recipe':
        await fetch('/api/recipes', {
          method: 'POST',
          headers,
          body: JSON.stringify(item.data)
        });
        break;
    }
  }

  // Clean up old cached recipes
  public async cleanupOldRecipes(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.initDB();

    const cutoffTime = Date.now() - maxAge;
    const recipes = await this.getCachedRecipes();
    
    for (const recipe of recipes) {
      if (recipe.cachedAt < cutoffTime && !recipe.isFavorite) {
        await this.deleteFromStore('recipes', recipe.id);
      }
    }
  }

  // Clean up old search history
  private async cleanupOldSearchHistory(maxItems: number = 50): Promise<void> {
    const history = await this.getSearchHistory(maxItems + 10);
    
    if (history.length > maxItems) {
      const itemsToDelete = history.slice(maxItems);
      for (const item of itemsToDelete) {
        await this.deleteFromStore('searchHistory', item.id);
      }
    }
  }

  // Generic store operations
  private async saveToStore(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromStore(storeName: string, id: string): Promise<any> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllFromStore(storeName: string): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get storage usage information
  public async getStorageInfo(): Promise<{
    totalRecipes: number;
    favoriteRecipes: number;
    searchHistory: number;
    queueItems: number;
    estimatedSize: string;
  }> {
    if (!this.db) await this.initDB();

    const recipes = await this.getCachedRecipes();
    const searchHistory = await this.getSearchHistory(100);
    const queueItems = await this.getAllFromStore('offlineQueue');

    return {
      totalRecipes: recipes.length,
      favoriteRecipes: recipes.filter(r => r.isFavorite).length,
      searchHistory: searchHistory.length,
      queueItems: queueItems.length,
      estimatedSize: this.formatBytes(this.estimateDataSize(recipes, searchHistory, queueItems))
    };
  }

  private estimateDataSize(recipes: any[], searchHistory: any[], queueItems: any[]): number {
    const recipeSize = recipes.reduce((total, recipe) => {
      return total + JSON.stringify(recipe).length;
    }, 0);

    const searchSize = searchHistory.reduce((total, search) => {
      return total + JSON.stringify(search).length;
    }, 0);

    const queueSize = queueItems.reduce((total, item) => {
      return total + JSON.stringify(item).length;
    }, 0);

    return recipeSize + searchSize + queueSize;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clear all offline data
  public async clearAllData(): Promise<void> {
    if (!this.db) await this.initDB();

    const stores = ['recipes', 'searchHistory', 'userPreferences', 'offlineQueue'];
    
    for (const storeName of stores) {
      await this.clearStore(storeName);
    }
  }

  private async clearStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();

// Export utility functions
export const cacheRecipeOffline = (recipe: any) => offlineManager.cacheRecipe(recipe);
export const getCachedRecipe = (id: string) => offlineManager.getCachedRecipe(id);
export const getCachedRecipes = (filters?: any) => offlineManager.getCachedRecipes(filters);
export const searchOfflineRecipes = (query: string) => offlineManager.searchCachedRecipes(query);
export const saveOfflineSearch = (query: string, filters: any, results: number) => 
  offlineManager.saveSearchHistory(query, filters, results);
export const getOfflineSearchHistory = (limit?: number) => offlineManager.getSearchHistory(limit);
export const addToOfflineQueue = (action: any) => offlineManager.addToOfflineQueue(action);
export const processOfflineQueue = () => offlineManager.processOfflineQueue();
export const getOfflineStorageInfo = () => offlineManager.getStorageInfo();
export const clearOfflineData = () => offlineManager.clearAllData(); 