import { FunctionComponent } from "react";
import { GlobalStyles as _GlobalStyles, useTheme } from "@mui/material";
import { footerHeight } from "./ServiceStatistics";
import {
  bgTransparentDark,
  bgTransparentDarkWithBlur,
} from "./CustomThemeProvider";

export const GlobalStyles: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const {
    palette: { info, success, warning, error },
    spacing,
  } = useTheme();

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
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

        /**
         * Toastify
         */
        ":root": {
          "--toastify-toast-bottom": `${footerHeight + parseInt(spacing(1))}px`,
          "--toastify-toast-width": `400px`,
          "--toastify-color-info": info.main,
          "--toastify-color-success": success.main,
          "--toastify-color-warning": warning.main,
          "--toastify-color-error": error.main,
          "--toastify-color-dark": bgTransparentDark.background,
        },

        ".Toastify__toast": {
          backdropFilter: bgTransparentDarkWithBlur.backdropFilter,
          marginBottom: spacing(1),
        },
      }}
    />
  );
};
