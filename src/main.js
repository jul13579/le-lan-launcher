import Vue from "vue";
import Vuesax from "vuesax";
import Vuex from "vuex";

// Components
import App from "./App.vue";

// Styles
import "vuesax/dist/vuesax.css"; //Vuesax styles

Vue.use(Vuesax, {
  // options
});
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    primaryColor: localStorage.getItem("primaryColor") || "rgb(0,0,0)"
  },
  mutations: {
    primaryColor(state, color) {
      localStorage.setItem("primaryColor", color);
    }
  }
});

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
