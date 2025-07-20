import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/router";
import { clearAllCaches } from "@/utils/cacheUtils";
import LanguageSelector from "../common/LanguageSelector";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const router = useRouter();
  
  const handleClearCaches = async () => {
    const confirmed = confirm('Clear all caches? This might help if you\'re experiencing issues. You\'ll stay logged in.');
    if (confirmed) {
      await clearAllCaches();
      alert('Caches cleared! The page will refresh.');
      window.location.reload();
    }
  };
  
  // Hide search boxes when on search page
  const isSearchPage = router.pathname === '/search';
  
  // Show cache clear button only in development or when needed
  const showCacheButton = process.env.NODE_ENV === 'development' || 
                          (typeof window !== 'undefined' && window.location.search.includes('debug=true'));

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/home')}
              className="text-2xl sm:text-3xl font-heading font-bold text-primary hover:text-orange-700 transition-colors cursor-pointer"
            >
              FoodToday
            </button>
            <span className="hidden sm:block ml-2 text-sm text-gray-500 tracking-wide">
              Personalized Recipes
            </span>
          </div>
          
          {/* Top Right Navigation */}
          <div className="flex items-center space-x-3">
            {/* Language Selector - Always visible */}
            <LanguageSelector compact={true} />
            
            {user ? (
              <>
                {/* Top Right Icons */}
                <button
                  onClick={() => router.push('/messages')}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="Messages"
                >
                  <span className="text-lg">💬</span>
                </button>
                
                <button
                  onClick={() => router.push('/notifications')}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="Notifications"
                >
                  <span className="text-lg">🔔</span>
                </button>
                
                <button
                  onClick={() => router.push('/shopping-list')}
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                  title="Shopping List"
                >
                  <span className="text-lg">🛒</span>
                </button>
                
                {showCacheButton && (
                  <button
                    onClick={handleClearCaches}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Clear caches (if having issues)"
                  >
                    <span className="text-sm">🧹</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {showCacheButton && (
                  <button
                    onClick={handleClearCaches}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors text-xs"
                    title="Clear caches (if having issues)"
                  >
                    🧹
                  </button>
                )}
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
        

      </div>
    </header>
  );
};

export default Header;