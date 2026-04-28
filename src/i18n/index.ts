import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const RTL_LANGS = ["ar", "he", "fa", "ur"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  });

const applyDir = (lng: string) => {
  const dir = RTL_LANGS.includes(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};
applyDir(i18n.language || "en");
i18n.on("languageChanged", applyDir);

export default i18n;
