import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import ka from "./locales/ka.json";
import en from "./locales/en.json";
import i18n from "i18next";
export const LANGUAGES = [
  { code: "ka", label: "ქარ" },
  { code: "en", label: "ENG" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { ka: { translation: ka }, en: { translation: en } },
    fallbackLng: "ka",
    supportedLngs: LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false }, // React თავად იცავს XSS-ისგან
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  });

// <html lang="..."> ენასთან ერთად იცვლებოდეს (ეკრანის წამკითხველი, ფონტები)
document.documentElement.lang = i18n.resolvedLanguage;
i18n.on("languageChanged", (lng) => (document.documentElement.lang = lng));

export default i18n;