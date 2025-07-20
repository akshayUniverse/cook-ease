import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  const { currentLanguage, setLanguage, t } = useTranslation();

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi' as const, name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
  ];

  if (compact) {
    return (
      <div className={`relative inline-block ${className}`}>
        <select
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.nativeName}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.516 7.548L10 11.953l4.484-4.405a.75.75 0 111.032 1.094l-5 4.922a.75.75 0 01-1.032 0l-5-4.922a.75.75 0 111.032-1.094z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 flex items-center">
        🌐 {t('preferences.language', 'Language')}:
      </span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentLanguage === lang.code
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector; 