import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import { useSettingsService } from "../hooks/useSettingsService";
import { StyleSheetManager } from "styled-components";

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: FunctionComponent<
  CustomThemeProviderProps
> = ({ children }) => {
  const { primaryColorHex } = useSettingsService();
  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: primaryColorHex,
      },
      background: {
        paper: "#000",
      },
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
