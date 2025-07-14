import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // Hide search boxes when on search page
  const isSearchPage = router.pathname === '/search';

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
              CookEase
            </button>
            <span className="hidden sm:block ml-2 text-sm text-gray-500 tracking-wide">
              Personalized Recipes
            </span>
          </div>
          
          {/* User Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Navigation Links */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push('/preferences')}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>⚙️</span>
                    <span className="hidden sm:inline">Preferences</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/library')}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>📚</span>
                    <span className="hidden sm:inline">Library</span>
                  </button>
                  

                  
                  <button
                    onClick={() => router.push('/shopping-list')}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>🛒</span>
                    <span className="hidden sm:inline">Shopping List</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/recipe/add')}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>➕</span>
                    <span className="hidden sm:inline">Add Recipe</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>👤</span>
                    <span className="hidden sm:inline">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
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
        
        {/* Search Bar for larger screens - Hidden on search page */}
        {!isSearchPage && (
          <div className="hidden lg:flex justify-center mt-4">
            <div className="relative w-full max-w-md">
              <form onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (searchInput.value.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
                }
              }}>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full px-3 py-1 text-sm hover:bg-orange-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Mobile Search Bar - Hidden on search page */}
        {!isSearchPage && (
          <div className="lg:hidden mt-4 px-4">
            <div className="relative">
              <form onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (searchInput.value.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
                }
              }}>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full px-3 py-1 text-sm hover:bg-orange-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;