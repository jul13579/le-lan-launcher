import { ThemeProvider } from "@emotion/react";
import { FunctionComponent, ReactNode, useMemo } from "react";
import { useSettingsService } from "../hooks/useSettingsService";
import { createTheme } from "@mui/material";
import hslToHex from "hsl-to-hex";

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: FunctionComponent<
  CustomThemeProviderProps
> = ({ children }) => {
  const { backgroundHue } = useSettingsService();
  const backgroundColorHex = useMemo(() => {
    return hslToHex(backgroundHue, 100, 60);
  }, [backgroundHue]);
  const theme = createTheme({
    palette: {
      primary: {
        main: backgroundColorHex,
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
