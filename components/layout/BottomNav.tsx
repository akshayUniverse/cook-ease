import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

export default function BottomNav() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-between items-center px-8 py-3 max-w-md mx-auto">
        {/* Home Button - Left */}
        <button
          onClick={() => router.push('/home')}
          className={`flex flex-col items-center space-y-1 px-3 py-2 transition-colors ${
            router.pathname === '/home' 
              ? 'text-primary' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Create Recipe - Center */}
        <button
          onClick={() => router.push('/recipe/add')}
          className={`flex flex-col items-center space-y-1 px-4 py-2 transition-colors ${
            router.pathname === '/recipe/add' 
              ? 'text-primary' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <span className="text-xl">➕</span>
          <span className="text-xs font-medium">Create</span>
        </button>

        {/* Profile - Right */}
        <button
          onClick={() => router.push('/profile')}
          className={`flex flex-col items-center space-y-1 px-3 py-2 transition-colors ${
            router.pathname === '/profile' 
              ? 'text-primary' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
} 