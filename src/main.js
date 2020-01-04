import Vue from "vue";
import Vuesax from "vuesax";
import Toasted from "vue-toasted";

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

Vue.use(Toasted, {
    position: 'bottom-center',
    duration: 5000
});

// Lets Register a Global Error Notification Toast.
Vue.toasted.register(
  "success",
  message => {
    return message;
  },
  {
    type: "success",
    icon: "check"
  }
);


import store from "./store";

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
