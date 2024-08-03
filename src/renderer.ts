// import Vue from "vue";
// import Toasted from "vue-toasted";
// import VueI18n from "vue-i18n";

// import vuetify from "./plugins/vuetify";

// // Components
// import App from "./App.vue";

// import store from "./store";
// import langs from "./localization/langs";
// import numberFormats from "./localization/numberformats";

// // Styles
// import "roboto-fontface/css/roboto/roboto-fontface.css";
// import "./sass/app.scss";

// Vue.use(Toasted, {
//   position: "bottom-center",
//   duration: 5000,
// });
// Vue.use(VueI18n);

// const i18n = new VueI18n({
//   locale: store.state.locale, // set locale
//   numberFormats,
//   messages: langs, // set locale messages
// });

// Vue.config.productionTip = false;

// new Vue({
//   vuetify,
//   store,
//   i18n,
//   render: (h) => h(App),
// }).$mount("#app");

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./sass/app.scss";
import "./sass/scrollbar.scss";

import "./plugins/i18n";

import "./App";
