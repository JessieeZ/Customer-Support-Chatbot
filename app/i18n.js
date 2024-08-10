// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en/translation.json';
import translationES from './es/translation.json';
import translationCH from './ch/translation.json';
import translationFR from './fr/translation.json';
import translationHI from './hi/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  },
  ch: {
    translation: translationCH
  },
  fr: {
    translation: translationFR
  },
  hi: {
    translation: translationHI
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    fallbackLng: "en", // Fallback language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
