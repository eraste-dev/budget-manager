import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'fr' | 'en';

export function useLanguage() {
    const { i18n } = useTranslation();

    const currentLanguage = i18n.language as Language;

    const changeLanguage = useCallback(
        (lang: Language) => {
            i18n.changeLanguage(lang);
            localStorage.setItem('language', lang);
        },
        [i18n],
    );

    const toggleLanguage = useCallback(() => {
        const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
        changeLanguage(newLang);
    }, [currentLanguage, changeLanguage]);

    return {
        currentLanguage,
        changeLanguage,
        toggleLanguage,
        isFrench: currentLanguage === 'fr',
        isEnglish: currentLanguage === 'en',
    };
}
