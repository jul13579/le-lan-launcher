import Vue from "vue";
import Vuesax from "vuesax";

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

import store from "./store";
import "./toaster"

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
