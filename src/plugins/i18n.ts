import { use } from "i18next";
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

const i18n = use(initReactI18next);
i18n.init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

i18n.services.formatter.addCached("mbps", (lng) => (value) => {
  const formatter = Intl.NumberFormat(lng, {
    style: "unit",
    unit: "megabyte-per-second",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
});

export { i18n };
