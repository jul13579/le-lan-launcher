import { createApp } from "vue";
import Toasted from "vue-toasted";
import { createI18n } from "vue-i18n";

import vuetify from "./plugins/vuetify";

// Components
import App from "./App.vue";

import store from "./store";
import langs from "./localization/langs";
import numberFormats from "./localization/numberformats";

// Styles
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./sass/app.scss";

// Vue.use(Toasted, {
//   position: "bottom-center",
//   duration: 5000,
// });

const i18n = createI18n({
  locale: store.state.locale, // set locale
  numberFormats,
  messages: langs, // set locale messages
});

// Vue.config.productionTip = false;

const app = createApp({
  App,
});

app.use(i18n);
app.use(store);
app.use(vuetify);

app.mount("#app");
