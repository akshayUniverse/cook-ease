import React from 'react';
import BottomNav from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Mobile Layout (sm and below) */}
      <div className="sm:hidden min-h-screen flex flex-col">
        <div className="flex-1 w-full bg-white/95 rounded-t-3xl mt-8 overflow-hidden">
          {children}
        </div>
        <BottomNav />
      </div>

      {/* Desktop/Tablet Layout (md and above) */}
      <div className="hidden sm:flex min-h-screen">
        {/* Left Sidebar - could be used for navigation in future */}
        <div className="hidden lg:block w-64 bg-white/10"></div>
        
        {/* Main Content Area */}
        <div className="flex-1 max-w-6xl mx-auto bg-white/95 shadow-2xl">
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            {/* Desktop Bottom Nav */}
            <div className="hidden sm:block">
              <BottomNav />
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - could be used for recommendations in future */}
        <div className="hidden lg:block w-64 bg-white/10"></div>
      </div>
    </div>
  );
};

export default MainLayout; 