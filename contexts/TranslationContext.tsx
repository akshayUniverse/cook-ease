import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation type definitions
type Language = 'en' | 'hi';

interface TranslationContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateText: (text: string, targetLang?: Language) => Promise<string>;
  isRTL: boolean;
}

// Create context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.library': 'Library',
    'nav.profile': 'Profile',
    
    // Home page
    'home.todaySuggestions': 'Get Today\'s Suggestions',
    'home.meal.all': 'All',
    'home.meal.breakfast': 'Breakfast',
    'home.meal.lunch': 'Lunch',
    'home.meal.dinner': 'Dinner',
    'home.meal.snacks': 'Snacks',
    'home.difficulty.easy': 'Easy',
    'home.difficulty.medium': 'Medium',
    'home.difficulty.hard': 'Hard',
    
    // Search
    'search.placeholder': 'Search for recipes or ingredients...',
    'search.ingredients': 'Search by ingredients',
    'search.noResults': 'No recipes found',
    
    // Recipe details
    'recipe.cookTime': 'Cook Time',
    'recipe.servings': 'Servings',
    'recipe.difficulty': 'Difficulty',
    'recipe.ingredients': 'Ingredients',
    'recipe.instructions': 'Instructions',
    'recipe.nutrition': 'Nutrition',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.like': 'Like',
    'common.share': 'Share',
    
    // Authentication
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    
    // Preferences
    'preferences.language': 'Language',
    'preferences.dietary': 'Dietary Preferences',
    'preferences.allergies': 'Allergies',
    'preferences.cuisine': 'Cuisine Preferences'
  },
  hi: {
    // Navigation  
    'nav.home': 'घर',
    'nav.search': 'खोजें',
    'nav.library': 'पुस्तकालय',
    'nav.profile': 'प्रोफाइल',
    
    // Home page
    'home.todaySuggestions': 'आज के सुझाव लें',
    'home.meal.all': 'सभी',
    'home.meal.breakfast': 'नाश्ता',
    'home.meal.lunch': 'दोपहर का खाना',
    'home.meal.dinner': 'रात का खाना',
    'home.meal.snacks': 'स्नैक्स',
    'home.difficulty.easy': 'आसान',
    'home.difficulty.medium': 'मध्यम',
    'home.difficulty.hard': 'कठिन',
    
    // Search
    'search.placeholder': 'व्यंजन या सामग्री खोजें...',
    'search.ingredients': 'सामग्री से खोजें',
    'search.noResults': 'कोई व्यंजन नहीं मिला',
    
    // Recipe details
    'recipe.cookTime': 'पकाने का समय',
    'recipe.servings': 'परोसने की संख्या',
    'recipe.difficulty': 'कठिनाई',
    'recipe.ingredients': 'सामग्री',
    'recipe.instructions': 'निर्देश',
    'recipe.nutrition': 'पोषण',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'कुछ गलत हुआ',
    'common.retry': 'फिर कोशिश करें',
    'common.save': 'सहेजें',
    'common.like': 'पसंद करें',
    'common.share': 'साझा करें',
    
    // Authentication
    'auth.login': 'लॉगिन',
    'auth.signup': 'साइन अप',
    'auth.logout': 'लॉगआउट',
    
    // Preferences
    'preferences.language': 'भाषा',
    'preferences.dietary': 'आहार प्राथमिकताएं',
    'preferences.allergies': 'एलर्जी',
    'preferences.cuisine': 'व्यंजन प्राथमिकताएं'
  }
};

// Google Translate API function (mock for now - will implement real API later)
const translateWithAPI = async (text: string, targetLang: Language): Promise<string> => {
  // For now, return original text. Will implement Google Translate API later
  // This is a placeholder to not break existing functionality
  return text;
};

// Translation Provider Component
interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const translation = translations[currentLanguage][key as keyof typeof translations['en']];
    return translation || fallback || key;
  };

  // Async translation for dynamic content
  const translateText = async (text: string, targetLang: Language = currentLanguage): Promise<string> => {
    if (targetLang === 'en' || !text) return text;
    
    try {
      return await translateWithAPI(text, targetLang);
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  };

  const value: TranslationContextType = {
    currentLanguage,
    setLanguage,
    t,
    translateText,
    isRTL: false // Hindi is LTR like English
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translation
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}; 