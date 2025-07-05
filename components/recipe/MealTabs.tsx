import React from 'react';

interface MealTabsProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
}

const MealTabs: React.FC<MealTabsProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default MealTabs;