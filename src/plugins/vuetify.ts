import { createVuetify } from "vuetify";
import "vuetify/styles"; // Without this, e.g. the tabs hover color wouldn't be correct

const opts = {
  theme: {
    defaultTheme: 'dark',
  },
  icons: {
    defaultSet: "mdi",
  },
};

export default createVuetify(opts);
