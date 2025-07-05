import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">
              CookEase
            </h1>
            <span className="hidden sm:block ml-2 text-sm text-gray-500 tracking-wide">
              Personalized Recipes
            </span>
          </div>
          
          {/* User Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hello, {user.name}</span>
                </div>
                
                {/* Navigation Links */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.location.href = '/preferences'}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>⚙️</span>
                    <span className="hidden sm:inline">Preferences</span>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/library'}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>📚</span>
                    <span className="hidden sm:inline">Library</span>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <span>👤</span>
                    <span className="hidden sm:inline">Profile</span>
                  </button>
                  
                  <button
                    onClick={logout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="bg-primary hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Search Bar for larger screens */}
        <div className="hidden lg:flex justify-center mt-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full px-3 py-1 text-sm hover:bg-orange-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;