import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import { uiText } from './uiTranslations';

const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => new URLSearchParams(location.search).get('editorLanguage') === 'am' ? 'am' : 'en');
  useLayoutEffect(() => { document.documentElement.lang = lang === 'am' ? 'hy' : 'en'; }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
export function useUi() {
  const { lang } = useLanguage();
  return (value, context) => uiText(value, lang, context);
}
