import { createContext, useContext, useEffect, useState } from "react";
import { messages } from "../i18n/messages";
const Context = createContext(null);
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("dw-language") === "en" ? "en" : "es";
    } catch {
      return "es";
    }
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("dw-language", lang);
    } catch {
      /* Storage can be blocked. */
    }
  }, [lang]);
  return (
    <Context.Provider
      value={{ lang, setLang, t: messages[lang], tr: (value) => value[lang] }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLanguage = () => useContext(Context);
