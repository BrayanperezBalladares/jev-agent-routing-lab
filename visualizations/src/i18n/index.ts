import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './constants';

import enCommon from '../locales/en/common.json';
import enStory from '../locales/en/story.json';
import enOverview from '../locales/en/overview.json';
import enMethodology from '../locales/en/methodology.json';
import enCharts from '../locales/en/charts.json';

import esCommon from '../locales/es/common.json';
import esStory from '../locales/es/story.json';
import esOverview from '../locales/es/overview.json';
import esMethodology from '../locales/es/methodology.json';
import esCharts from '../locales/es/charts.json';

function getInitialLanguage(): string {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'es') {
      return stored;
    }
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')) {
      return 'es';
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_LOCALE;
}

const resources = {
  en: {
    common: enCommon,
    story: enStory,
    overview: enOverview,
    methodology: enMethodology,
    charts: enCharts,
  },
  es: {
    common: esCommon,
    story: esStory,
    overview: esOverview,
    methodology: esMethodology,
    charts: esCharts,
  },
};

const initialLng = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: 'common',
    ns: ['common', 'story', 'overview', 'methodology', 'charts'],
    interpolation: {
      escapeValue: false,
    },
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLng;
}

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
    }
  } catch {
    // Ignore localStorage errors
  }
});

export default i18n;
