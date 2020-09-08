import Vue from "vue";
// import Vuesax from "vuesax";
import Toasted from "vue-toasted";
import VueI18n from "vue-i18n";

import vuetify from "@/plugins/vuetify";

// Components
import App from "./App.vue";

import store from "./store";
import langs from "./langs.js";

// Styles
// import "material-icons/iconfont/material-icons.css";
// import "./stylus/vuesax.styl";
import "vuetify/dist/vuetify.min.css";
import "./sass/app.sass";

// Vue.use(Vuesax, {
//   theme: {
//     colors: {
//       primary: "#FFF",
//       // success:'rgb(23, 201, 100)',
//       // danger:'rgb(242, 19, 93)',
//       // warning:'rgb(255, 130, 0)',
//       // dark:'rgb(36, 33, 69)'
//     },
//   },
// });
Vue.use(Toasted, {
  position: "bottom-center",
  duration: 5000,
});
Vue.use(VueI18n);

// Lets Register a Global Error Notification Toast.
Vue.toasted.register(
  "success",
  (message) => {
    return message;
  },
  {
    type: "success",
    icon: "check",
  }
);
Vue.toasted.register(
  "error",
  (message) => {
    return message;
  },
  {
    type: "error",
    icon: "error_outline",
  }
);

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
