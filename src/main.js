import Vue from "vue";
import Vuesax from "vuesax";
import Vuex from "vuex";

// Components
import App from "./App.vue";

// Styles
import "material-icons/iconfont/material-icons.css";
import "./stylus/vuesax.styl";
import "./sass/app.sass";

Vue.use(Vuesax, {
  theme: {
    colors: {
      primary: "#FFF"
      // success:'rgb(23, 201, 100)',
      // danger:'rgb(242, 19, 93)',
      // warning:'rgb(255, 130, 0)',
      // dark:'rgb(36, 33, 69)'
    }
  }
});
Vue.use(Vuex);

const defaultBackgroundColor = "rgb(15, 5, 35)";

const store = new Vuex.Store({
  state: {
    backgroundColor:
      localStorage.getItem("backgroundColor") || defaultBackgroundColor,
    setupCompleted: localStorage.getItem("setupCompleted") || false
  },
  mutations: {
    backgroundColor(state, color) {
      localStorage.setItem("backgroundColor", color);
    },
    setupCompleted(state, bool) {
      localStorage.setItem("setupCompleted", bool);
    }
  }
});

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
