import React from "react";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "CookEase" }) => {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {title}
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400">
              <span className="sr-only">Profile</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;