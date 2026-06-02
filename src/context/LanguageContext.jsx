/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { translate } from '../i18n/translations';

const STORAGE_KEY = 'ym_language';

export const languageOptions = [
  { value: 'ru', label: 'Русский', shortLabel: 'RU' },
  { value: 'en', label: 'English', shortLabel: 'EN' },
  { value: 'kk', label: 'Қазақша', shortLabel: 'KZ' },
];

const LanguageContext = createContext(null);

const getInitialLanguage = () => {
  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return languageOptions.some((option) => option.value === storedLanguage)
    ? storedLanguage
    : 'ru';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    const normalizedLanguage = languageOptions.some((option) => option.value === nextLanguage)
      ? nextLanguage
      : 'ru';

    window.localStorage.setItem(STORAGE_KEY, normalizedLanguage);
    setLanguageState(normalizedLanguage);
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    currentLanguage: languageOptions.find((option) => option.value === language) || languageOptions[0],
    t: (key, params) => translate(language, key, params),
  }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage должен использоваться внутри LanguageProvider');
  }

  return context;
};
