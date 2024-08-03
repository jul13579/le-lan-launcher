import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import { useSettingsService } from "../hooks/useSettingsService";

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

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
