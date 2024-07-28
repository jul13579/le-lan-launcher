import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../localization/en";
import de from "../localization/de";

const resources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export { i18n };
