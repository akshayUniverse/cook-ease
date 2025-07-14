import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface SearchFilters {
  search: string;
  mealType: string;
  cuisine: string;
  difficulty: string;
  ingredients: string;
  tags: string;
  caloriesMin: number | undefined;
  caloriesMax: number | undefined;
  proteinMin: number | undefined;
  proteinMax: number | undefined;
  carbsMin: number | undefined;
  carbsMax: number | undefined;
  fatMin: number | undefined;
  fatMax: number | undefined;
  cookTimeMin: number | undefined;
  cookTimeMax: number | undefined;
  sortBy: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onSearch, 
  onReset, 
  isOpen, 
  onToggle 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    mealType: 'all',
    cuisine: 'all',
    difficulty: 'all',
    ingredients: '',
    tags: '',
    caloriesMin: undefined,
    caloriesMax: undefined,
    proteinMin: undefined,
    proteinMax: undefined,
    carbsMin: undefined,
    carbsMax: undefined,
    fatMin: undefined,
    fatMax: undefined,
    cookTimeMin: undefined,
    cookTimeMax: undefined,
    sortBy: 'newest'
  });

  const [activeTab, setActiveTab] = useState('basic');

  // Options for dropdowns
  const mealTypes = ['all', 'breakfast', 'lunch', 'dinner', 'snack'];
  const cuisines = ['all', 'american', 'italian', 'mexican', 'indian', 'chinese', 'japanese', 'thai', 'french', 'greek', 'mediterranean', 'other'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'cookTime', label: 'Cook Time' },
    { value: 'calories', label: 'Calories' },
    { value: 'rating', label: 'Rating' }
  ];

  const commonTags = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 
    'low-carb', 'high-protein', 'quick', 'healthy', 'comfort-food', 
    'kid-friendly', 'spicy', 'mediterranean'
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      mealType: 'all',
      cuisine: 'all',
      difficulty: 'all',
      ingredients: '',
      tags: '',
      caloriesMin: undefined,
      caloriesMax: undefined,
      proteinMin: undefined,
      proteinMax: undefined,
      carbsMin: undefined,
      carbsMax: undefined,
      fatMin: undefined,
      fatMax: undefined,
      cookTimeMin: undefined,
      cookTimeMax: undefined,
      sortBy: 'newest'
    });
    onReset();
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags.split(',').map(t => t.trim()).filter(t => t);
    if (currentTags.includes(tag)) {
      const newTags = currentTags.filter(t => t !== tag);
      handleFilterChange('tags', newTags.join(', '));
    } else {
      handleFilterChange('tags', [...currentTags, tag].join(', '));
    }
  };

  const isTagSelected = (tag: string) => {
    return filters.tags.split(',').map(t => t.trim()).includes(tag);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.mealType !== 'all') count++;
    if (filters.cuisine !== 'all') count++;
    if (filters.difficulty !== 'all') count++;
    if (filters.ingredients) count++;
    if (filters.tags) count++;
    if (filters.caloriesMin !== undefined || filters.caloriesMax !== undefined) count++;
    if (filters.proteinMin !== undefined || filters.proteinMax !== undefined) count++;
    if (filters.carbsMin !== undefined || filters.carbsMax !== undefined) count++;
    if (filters.fatMin !== undefined || filters.fatMax !== undefined) count++;
    if (filters.cookTimeMin !== undefined || filters.cookTimeMax !== undefined) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  const RangeSlider: React.FC<{
    label: string;
    min: number;
    max: number;
    step: number;
    value: [number | undefined, number | undefined];
    onChange: (value: [number | undefined, number | undefined]) => void;
    unit?: string;
  }> = ({ label, min, max, step, value, onChange, unit = '' }) => {
    const [minVal, maxVal] = value;
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder={`Min ${unit}`}
            value={minVal ?? ''}
            onChange={(e) => onChange([e.target.value ? parseInt(e.target.value) : undefined, maxVal])}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            placeholder={`Max ${unit}`}
            value={maxVal ?? ''}
            onChange={(e) => onChange([minVal, e.target.value ? parseInt(e.target.value) : undefined])}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span className="font-medium">Advanced Search</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center space-x-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Advanced Search Panel */}
      {isOpen && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4">
            {['basic', 'nutrition', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search Query */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Recipe
                  </label>
                  <input
                    type="text"
                    placeholder="Recipe name, description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Meal Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={filters.mealType}
                    onChange={(e) => handleFilterChange('mealType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {mealTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cuisine */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine
                  </label>
                  <select
                    value={filters.cuisine}
                    onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {cuisines.map(cuisine => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cook Time */}
                <div className="lg:col-span-1">
                  <RangeSlider
                    label="Cook Time"
                    min={0}
                    max={180}
                    step={5}
                    value={[filters.cookTimeMin, filters.cookTimeMax]}
                    onChange={([min, max]) => {
                      handleFilterChange('cookTimeMin', min);
                      handleFilterChange('cookTimeMax', max);
                    }}
                    unit="mins"
                  />
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RangeSlider
                  label="Calories"
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.caloriesMin, filters.caloriesMax]}
                  onChange={([min, max]) => {
                    handleFilterChange('caloriesMin', min);
                    handleFilterChange('caloriesMax', max);
                  }}
                  unit="cal"
                />
                
                <RangeSlider
                  label="Protein"
                  min={0}
                  max={100}
                  step={1}
                  value={[filters.proteinMin, filters.proteinMax]}
                  onChange={([min, max]) => {
                    handleFilterChange('proteinMin', min);
                    handleFilterChange('proteinMax', max);
                  }}
                  unit="g"
                />
                
                <RangeSlider
                  label="Carbohydrates"
                  min={0}
                  max={200}
                  step={1}
                  value={[filters.carbsMin, filters.carbsMax]}
                  onChange={([min, max]) => {
                    handleFilterChange('carbsMin', min);
                    handleFilterChange('carbsMax', max);
                  }}
                  unit="g"
                />
                
                <RangeSlider
                  label="Fat"
                  min={0}
                  max={100}
                  step={1}
                  value={[filters.fatMin, filters.fatMax]}
                  onChange={([min, max]) => {
                    handleFilterChange('fatMin', min);
                    handleFilterChange('fatMax', max);
                  }}
                  unit="g"
                />
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-4">
                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients (I Have)
                  </label>
                  <input
                    type="text"
                    placeholder="chicken, tomatoes, onions (comma-separated)"
                    value={filters.ingredients}
                    onChange={(e) => handleFilterChange('ingredients', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Find recipes that can be made with these ingredients
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          isTagSelected(tag)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Tags Input */}
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Add custom tags (comma-separated)"
                      value={filters.tags}
                      onChange={(e) => handleFilterChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 