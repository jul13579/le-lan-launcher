import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import { StyleSheetManager } from "styled-components";
import { useSettingsService } from "../hooks/useSettingsService";
import { green, red, yellow } from "@mui/material/colors";

export const bgTransparentDark = {
  background: "rgba(0, 0, 0, 0.6)",
};

export const bgTransparentDarkWithBlur = {
  ...bgTransparentDark,
  backdropFilter: "blur(10px)",
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: FunctionComponent<
  CustomThemeProviderProps
> = ({ children }) => {
  const { primaryColorHex } = useSettingsService();
  let theme = createTheme({
    components: {
      // FABs for some reason have white background in dark theme. The below fixes the styling.
      MuiFab: {
        styleOverrides: {
          root: {
            width: "70px",
            height: "70px",
            color: "white",
            backgroundColor: bgTransparentDark.background,
            ":hover": {
              backgroundColor: "rgba(44, 44, 44, 0.6)",
            },
          },
        },
      },
      // Menus should also be dark with blurry backdrop filter
      MuiMenu: {
        styleOverrides: {
          paper: {
            ...bgTransparentDarkWithBlur,
          },
        },
      },
    },
    palette: {
      mode: "dark",
      primary: {
        main: primaryColorHex,
      },
    },
  });

  /**
   * Custom color definitions. Make sure to also apply the necessary changes in `/src/@types/CustomPalette.d.ts`!
   */
  theme = createTheme(theme, {
    palette: {
      green: theme.palette.augmentColor({
        color: {
          main: green.A700,
        },
        name: "green",
      }),
      yellow: theme.palette.augmentColor({
        color: {
          main: yellow.A700,
        },
        name: "yellow",
      }),
      red: theme.palette.augmentColor({
        color: {
          main: red.A700,
        },
        name: "red",
      }),
    },
  });

  return (
    // Prevent styled-components (dependency of react-epic-spinners) from forwarding some
    // props to the DOM
    <StyleSheetManager
      shouldForwardProp={(prop) =>
        prop !== "animationDuration" && prop !== "initialTopPosition"
      }
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyleSheetManager>
  );
};
