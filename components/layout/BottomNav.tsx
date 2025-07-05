import React from 'react';
import { useRouter } from 'next/router';

const navItems = [
  { label: 'Home', href: '/home', icon: '🏠' },
  { label: 'Library', href: '/library', icon: '📚' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

export default function BottomNav() {
  const router = useRouter();
  
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center py-3 z-50 shadow-lg">
        {navItems.map(item => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center text-xs font-heading px-4 py-2 transition-all duration-200 rounded-lg ${
              router.pathname.startsWith(item.href) 
                ? 'text-primary bg-primary/10' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Desktop/Tablet Navigation */}
      <nav className="hidden sm:flex bg-white/95 backdrop-blur-sm border-t border-gray-200 justify-center items-center py-4 shadow-lg">
        <div className="flex gap-8 lg:gap-12">
          {navItems.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 text-sm lg:text-base font-heading px-6 py-3 transition-all duration-200 rounded-xl ${
                router.pathname.startsWith(item.href) 
                  ? 'text-primary bg-primary/10 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg lg:text-xl">{item.icon}</span>
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
} 