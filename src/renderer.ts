import { createApp } from "vue";
// import Toasted from "vue-toasted";

import vuetify from "./plugins/vuetify";

// Components
import App from "./App.vue";

import store from "./plugins/store";

// Styles
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./sass/app.scss";
import createI18n from "./plugins/i18n";

// Vue.use(Toasted, {
//   position: "bottom-center",
//   duration: 5000,
// });


// Vue.config.productionTip = false;

const app = createApp(App);

app.use(store);
app.use(createI18n(store));
app.use(vuetify);

app.mount("#app");
