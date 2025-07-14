import React, { useState, useEffect } from 'react';
import { ClockIcon, BookmarkIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SearchFilters } from './AdvancedSearch';

interface SearchHistoryItem {
  id: string;
  name: string;
  filters: SearchFilters;
  timestamp: Date;
  isSaved?: boolean;
}

interface SearchHistoryProps {
  onApplySearch: (filters: SearchFilters) => void;
  currentFilters?: SearchFilters;
  onSaveCurrentSearch?: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  onApplySearch, 
  currentFilters, 
  onSaveCurrentSearch 
}) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SearchHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Load search history and saved searches from localStorage
  useEffect(() => {
    const loadSearchHistory = () => {
      try {
        const historyData = localStorage.getItem('searchHistory');
        const savedData = localStorage.getItem('savedSearches');
        
        if (historyData) {
          const parsedHistory = JSON.parse(historyData).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setSearchHistory(parsedHistory);
        }
        
        if (savedData) {
          const parsedSaved = JSON.parse(savedData).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setSavedSearches(parsedSaved);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };

    loadSearchHistory();
  }, []);

  // Save search history to localStorage
  const saveToHistory = (filters: SearchFilters, name?: string) => {
    const searchItem: SearchHistoryItem = {
      id: Date.now().toString(),
      name: name || generateSearchName(filters),
      filters,
      timestamp: new Date(),
      isSaved: false
    };

    const updatedHistory = [searchItem, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // Save search permanently
  const saveSearch = (name: string, filters: SearchFilters) => {
    const searchItem: SearchHistoryItem = {
      id: Date.now().toString(),
      name,
      filters,
      timestamp: new Date(),
      isSaved: true
    };

    const updatedSaved = [searchItem, ...savedSearches];
    setSavedSearches(updatedSaved);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSaved));
  };

  // Generate a descriptive name for the search
  const generateSearchName = (filters: SearchFilters): string => {
    const parts = [];
    
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.mealType && filters.mealType !== 'all') parts.push(filters.mealType);
    if (filters.cuisine && filters.cuisine !== 'all') parts.push(filters.cuisine);
    if (filters.difficulty && filters.difficulty !== 'all') parts.push(filters.difficulty);
    if (filters.ingredients) parts.push(`with ${filters.ingredients}`);
    if (filters.tags) parts.push(`#${filters.tags.split(',')[0].trim()}`);
    
    // Add nutrition filters
    if (filters.caloriesMin !== undefined || filters.caloriesMax !== undefined) {
      parts.push('calories filtered');
    }
    if (filters.proteinMin !== undefined || filters.proteinMax !== undefined) {
      parts.push('protein filtered');
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Search';
  };

  // Delete search history item
  const deleteHistoryItem = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const updatedSaved = savedSearches.filter(item => item.id !== id);
    setSavedSearches(updatedSaved);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSaved));
  };

  // Clear all history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Handle save current search
  const handleSaveCurrentSearch = () => {
    if (currentFilters) {
      setShowSaveDialog(true);
      setSaveName(generateSearchName(currentFilters));
    }
  };

  // Handle save dialog submit
  const handleSaveDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim() && currentFilters) {
      saveSearch(saveName.trim(), currentFilters);
      setShowSaveDialog(false);
      setSaveName('');
    }
  };

  // Add current search to history when filters change
  useEffect(() => {
    if (currentFilters && hasActiveFilters(currentFilters)) {
      saveToHistory(currentFilters);
    }
  }, [currentFilters]);

  // Check if filters have active values
  const hasActiveFilters = (filters: SearchFilters): boolean => {
    return !!(
      filters.search ||
      (filters.mealType && filters.mealType !== 'all') ||
      (filters.cuisine && filters.cuisine !== 'all') ||
      (filters.difficulty && filters.difficulty !== 'all') ||
      filters.ingredients ||
      filters.tags ||
      filters.caloriesMin !== undefined ||
      filters.caloriesMax !== undefined ||
      filters.proteinMin !== undefined ||
      filters.proteinMax !== undefined ||
      filters.carbsMin !== undefined ||
      filters.carbsMax !== undefined ||
      filters.fatMin !== undefined ||
      filters.fatMax !== undefined ||
      filters.cookTimeMin !== undefined ||
      filters.cookTimeMax !== undefined ||
      (filters.sortBy && filters.sortBy !== 'newest')
    );
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const renderSearchItem = (item: SearchHistoryItem, isSaved: boolean) => (
    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </h4>
          {isSaved && (
            <BookmarkIcon className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(item.timestamp)}
        </p>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onApplySearch(item.filters)}
          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
          title="Apply this search"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => isSaved ? deleteSavedSearch(item.id) : deleteHistoryItem(item.id)}
          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Search History</h3>
        {currentFilters && hasActiveFilters(currentFilters) && (
          <button
            onClick={handleSaveCurrentSearch}
            className="flex items-center space-x-1 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
          >
            <BookmarkIcon className="h-4 w-4" />
            <span>Save Current Search</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ClockIcon className="h-4 w-4 inline mr-1" />
          Recent ({searchHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'saved'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BookmarkIcon className="h-4 w-4 inline mr-1" />
          Saved ({savedSearches.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {activeTab === 'history' ? (
          searchHistory.length > 0 ? (
            <>
              {searchHistory.map(item => renderSearchItem(item, false))}
              {searchHistory.length > 0 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Clear All History
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No search history yet</p>
              <p className="text-sm">Your recent searches will appear here</p>
            </div>
          )
        ) : (
          savedSearches.length > 0 ? (
            savedSearches.map(item => renderSearchItem(item, true))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookmarkIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No saved searches yet</p>
              <p className="text-sm">Save your favorite searches for quick access</p>
            </div>
          )
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Search</h3>
            
            <form onSubmit={handleSaveDialogSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter a name for this search"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistory; 