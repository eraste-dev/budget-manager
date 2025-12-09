import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
    fr: { translation: fr },
    en: { translation: en },
};

// Get saved language from localStorage or default to French
const savedLanguage = typeof window !== 'undefined'
    ? localStorage.getItem('language') || 'fr'
    : 'fr';

i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'fr',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
