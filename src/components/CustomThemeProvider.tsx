import { ThemeProvider } from "@emotion/react";
import { FunctionComponent, ReactNode } from "react";
import { useSettingsService } from "../hooks/useSettingsService";
import { createTheme } from "@mui/material";

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: FunctionComponent<
  CustomThemeProviderProps
> = ({ children }) => {
  const { backgroundHue } = useSettingsService();
  const theme = createTheme({});

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
