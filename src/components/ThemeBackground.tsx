import { styled } from "@mui/material";
import { FunctionComponent } from "react";
import { useSettingsService } from "../hooks/useSettingsService";
import { Settings } from "./contexts/SettingsService/SettingsServiceContext";

const FullScreenBox = styled("div")(() => ({
  position: "fixed",
  width: "100vw",
  height: "100vh",
  top: 0,
  left: 0,
}));

interface BackgroundProps {
  hue: number;
}
const Background = styled(FullScreenBox)<BackgroundProps>(({ hue }) => ({
  background: `linear-gradient(hsl(${hue}, 75%, 8%), black)`,
}));

interface ForegroundProps {
  themeConfig: Settings["theme"];
}
const Foreground = styled(FullScreenBox)<ForegroundProps>(
  ({ themeConfig }) => ({
    opacity: 0.1,
    background: `url('${themeConfig.path}')`,
    backgroundPosition: themeConfig.cover ? "center" : "initial",
    backgroundSize: themeConfig.cover ? "cover" : "initial",
  })
);

export const ThemeBackground: FunctionComponent = () => {
  const { backgroundHue, theme } = useSettingsService();
  return (
    <>
      <Background hue={backgroundHue} />
      <Foreground themeConfig={theme} />
    </>
  );
};
