import { createI18n as _createI18n } from "vue-i18n";
import langs from "../localization/langs";
import numberFormats from "../localization/numberformats";

const createI18n = (store: { state: { locale: keyof typeof langs } }) =>
  _createI18n({
    legacy: false,
    locale: store.state.locale, // set locale
    numberFormats,
    messages: langs, // set locale messages
  });

export default createI18n;
