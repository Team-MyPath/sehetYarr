'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, Language, Dictionary } from '../i18n/dictionaries';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  dictionary: Dictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Default to English
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage if available
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && dictionaries[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Set document direction and language for accessibility
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
  };

  const dictionary = dictionaries[language];
  const dir = language === 'en' ? 'ltr' : 'rtl';

  // Simple translation function supporting nested keys like 'common.dashboard'
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = dictionary;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir, dictionary }}>
      <div dir={dir} className="contents">
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

