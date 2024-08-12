import { FunctionComponent } from "react";
import { GlobalStyles as _GlobalStyles } from "@mui/material";

export const GlobalStyles: FunctionComponent = () => {
  return (
    <_GlobalStyles
      styles={{
        /**
         * App styles
         */
        html: {
          overflowY: "scroll",
        },
        "div#app": {
          height: "100vh",
        },

        /**
         * Scrollbar
         */
        "::-webkit-scrollbar": {
          height: 5, // For horizontal scrollbars
          width: 5, // For vertical scrollbars
          background: "rgba(0, 0, 0, 0.8)",
        },

        "::-webkit-scrollbar-thumb": {
          background: "rgb(200, 200, 200)",
          WebkitBoxShadow: "0px 1px 2px rgba(0, 0, 0, 0.75)",
        },

        "::-webkit-scrollbar-corner": {
          background: "none",
        },
      }}
    />
  );
};
