// Cache clearing utilities to fix incognito mode issues

export const clearAllCaches = async () => {
  try {
    console.log('🧹 Clearing all caches...');
    
    // Clear localStorage (except auth data)
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const preferencesKeys = Object.keys(localStorage).filter(key => key.startsWith('preferences_set_'));
    const favoritesKeys = Object.keys(localStorage).filter(key => key.startsWith('favorites_'));
    
    localStorage.clear();
    
    // Restore essential auth data
    if (authToken) localStorage.setItem('authToken', authToken);
    if (user) localStorage.setItem('user', user);
    preferencesKeys.forEach(key => localStorage.setItem(key, 'true'));
    favoritesKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) localStorage.setItem(key, value);
    });
    
    // Clear sessionStorage (except auth redirects)
    const redirectAfterLogin = sessionStorage.getItem('redirect_after_login');
    const redirectAfterPreferences = sessionStorage.getItem('redirect_after_preferences');
    const autoTriggerSuggestions = sessionStorage.getItem('auto_trigger_suggestions');
    
    sessionStorage.clear();
    
    // Restore essential session data
    if (redirectAfterLogin) sessionStorage.setItem('redirect_after_login', redirectAfterLogin);
    if (redirectAfterPreferences) sessionStorage.setItem('redirect_after_preferences', redirectAfterPreferences);
    if (autoTriggerSuggestions) sessionStorage.setItem('auto_trigger_suggestions', autoTriggerSuggestions);
    
    // Clear service worker cache if available
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ Service worker caches cleared');
    }
    
    console.log('✅ All caches cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
};

export const clearRecipeCaches = () => {
  try {
    console.log('🍽️ Clearing recipe-specific caches...');
    
    // Clear recipe-related localStorage items
    const keysToRemove = [
      'dailySuggestions',
      'searchHistory',
      'recentRecipes',
      'favoriteRecipes'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key} from localStorage`);
      }
    });
    
    // Clear recipe-related sessionStorage items
    const sessionKeysToRemove = [
      'currentRecipes',
      'searchResults',
      'lastSearch'
    ];
    
    sessionKeysToRemove.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Removed ${key} from sessionStorage`);
      }
    });
    
    console.log('✅ Recipe caches cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing recipe caches:', error);
    return false;
  }
};

export const forceRefreshPage = () => {
  try {
    console.log('🔄 Force refreshing page...');
    
    // Clear caches first
    clearRecipeCaches();
    
    // Add cache-busting parameter
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', Date.now().toString());
    
    // Replace current page with cache-busted version
    window.location.replace(url.toString());
  } catch (error) {
    console.error('❌ Error force refreshing page:', error);
    // Fallback to simple reload
    window.location.reload();
  }
};

export const addCacheBusting = (url: string): string => {
  try {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('_t', Date.now().toString());
    urlObj.searchParams.set('_rand', Math.random().toString(36).substring(7));
    return urlObj.toString();
  } catch (error) {
    console.error('❌ Error adding cache busting to URL:', error);
    return `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  }
};

// Add cache-busting headers to fetch requests
export const getCacheBustingHeaders = (): HeadersInit => {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest'
  };
};

// Enhanced fetch with cache busting
export const fetchWithCacheBusting = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const cacheBustedUrl = addCacheBusting(url);
  const cacheBustingHeaders = getCacheBustingHeaders();
  
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      ...cacheBustingHeaders,
      ...options.headers
    }
  };
  
  console.log(`🌐 Fetching with cache busting: ${cacheBustedUrl}`);
  return fetch(cacheBustedUrl, enhancedOptions);
}; 