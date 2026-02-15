import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import id from '@/locales/id.json';
import en from '@/locales/en.json';

// Language resources
const resources = {
  id: { translation: id },
  en: { translation: en },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id', // Default to Indonesian
    lng: 'id', // Force Indonesian as default
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kahade_language',
    },
  });

// Helper function to change language
export const changeLanguage = (lang: 'id' | 'en') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('kahade_language', lang);
};

// Helper function to get current language
export const getCurrentLanguage = (): 'id' | 'en' => {
  return (i18n.language || 'id') as 'id' | 'en';
};

export default i18n;
