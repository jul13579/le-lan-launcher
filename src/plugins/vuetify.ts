import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import "vuetify/styles"; // Without this, e.g. the tabs hover color wouldn't be correct

const opts = {
  theme: {
    defaultTheme: "dark",
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
};

export default createVuetify(opts);
