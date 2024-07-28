import { styled } from "@mui/material";
import { FunctionComponent } from "react";
import { useSettingsService } from "../hooks/useSettingsService";

const Background = styled("div")(() => ({
  position: "fixed",
  width: "100vw",
  height: "100vh",
  top: 0,
  left: 0,
}));

const Foreground = styled(Background)(() => ({
  opacity: 0.1,
}));

export const ThemeBackground: FunctionComponent = () => {
  const { backgroundHue, theme } = useSettingsService();
  return (
    <>
      <Background
        style={{
          background: `linear-gradient(hsl(${backgroundHue}, 75%, 8%), black)`,
        }}
      />
      <Foreground
        style={{
          background: `url('${theme.path}')`,
          backgroundPosition: theme.cover ? "center" : "initial",
          backgroundSize: theme.cover ? "cover" : "initial",
        }}
      />
    </>
  );
};
