import Vue from "vue";
import Vuesax from "vuesax";
import Vuex from "vuex";

// Components
import App from "./App.vue";

// Styles
import "vuesax/dist/vuesax.css"; //Vuesax styles
import "./sass/app.sass";

Vue.use(Vuesax, {
  // options
});
Vue.use(Vuex);

const defaultBackgroundColor = "rgb(15, 5, 35)";

const store = new Vuex.Store({
  state: {
    backgroundColor:
      localStorage.getItem("backgroundColor") || defaultBackgroundColor
  },
  mutations: {
    backgroundColor(state, color) {
      localStorage.setItem("backgroundColor", color);
    }
  }
});

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
