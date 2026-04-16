import { getLocales } from 'expo-localization';

import { I18n } from 'i18n-js';
import en from './_en.json';
import it from './_it.json';
import th from './_th.json';
import es from './_es.json';
import fr from './_fr.json';
import zhHans from './_zh-Hans.json';
import { storage_getStoredData, storage_saveStoredData } from '@/utils/Storage';

// Set translations
const i18n = new I18n({
    en: en,
    it: it,
    th: th,
    es: es,
    fr: fr,
    "zh-Hans": zhHans
});

// Initialize language
const initI18n = async () => {
  try {
    // Check for saved language preference
    const savedLanguage = await storage_getStoredData('family-trip-language');
    i18n.locale = savedLanguage || 'it'; // Use saved language or default to 'it'
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'it'; // Fallback to English
  }
  i18n.enableFallback = true; // Enable fallback for missing translations
  i18n.defaultLocale = 'it'; // Set default locale
};

// Public Function to switch language
export const switchLanguage = async (languageCode: string) => {
  try {
    // Update the locale
    i18n.locale = languageCode;
    // Save the new language preference to AsyncStorage
    await storage_saveStoredData('family-trip-language', languageCode);
  } catch (error) {
    console.error('Error switching language:', error);
  }
};

// Call initialization
initI18n();

export default i18n 