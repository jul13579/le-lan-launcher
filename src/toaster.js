import Vue from "vue";
import Toasted from "vue-toasted";

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
