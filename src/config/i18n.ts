import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import apiKeysEN from '@/locales/en/api-keys.json';
import commonEN from '@/locales/en/common.json';
import sidebarEN from '@/locales/en/sidebar.json';
import apiKeysVI from '@/locales/vi/api-keys.json';
import commonVI from '@/locales/vi/common.json';
import sidebarVI from '@/locales/vi/sidebar.json';

const resources = {
  en: {
    common: commonEN,
    sidebar: sidebarEN,
    apiKeys: apiKeysEN,
  },
  vi: {
    common: commonVI,
    sidebar: sidebarVI,
    apiKeys: apiKeysVI,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
