import axios from "axios";
import store from "./store";

const host = "http://localhost:8384/rest";

store.subscribe(mutation => {
  console.log(mutation);
  if (mutation.type == "apikey") {
    axios.defaults.headers.common["X-API-Key"] = mutation.payload;
  }
});

export default {
  Syncthing: {
    System: {
      ping: () => {
        return axios.get(host + "/system/ping");
      }
    }
  }
};
