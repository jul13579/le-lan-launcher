import Vue from "vue";
import Toasted from "vue-toasted";
import VueI18n from "vue-i18n";

import vuetify from "@/plugins/vuetify";

// Components
import App from "./App.vue";

import store from "./store";
import langs from "./langs.js";

// Styles
import "@/sass/app.sass";

Vue.use(Toasted, {
  position: "bottom-center",
  duration: 5000,
});
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: store.state.locale, // set locale
  messages: langs, // set locale messages
});

Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
