import React, { useState } from "react";

interface MealTabsProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
}

const MealTabs: React.FC<MealTabsProps> = ({
  categories = ["Popular", "Pasta", "Salads", "Breakfast"],
  onSelectCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onSelectCategory(category);
  };

  return (
    <div className="mb-6 overflow-x-auto scrollbar-hide">
      <div className="flex space-x-4 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MealTabs;