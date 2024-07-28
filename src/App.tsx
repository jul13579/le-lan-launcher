import { mdiClose, mdiWindowMaximize, mdiWindowMinimize } from "@mdi/js";
import Icon from "@mdi/react";
import {
  AppBar,
  Avatar,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FunctionComponent, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SettingsServiceContextProvider } from "./components/contexts/SettingsService/SettingsServiceContextProvider";
import { SyncServiceContextProvider } from "./components/contexts/SyncService/SyncServiceContextProvider";
import { CustomThemeProvider } from "./components/CustomThemeProvider";
import { useWindowControls } from "./hooks/useWindowControls";

const ProminentToolbar = styled(Toolbar)(({ theme }) => ({
  alignItems: "flex-start",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  // Override media queries injected by theme.mixins.toolbar
  "@media all": {
    minHeight: 128,
  },
}));

const ToolbarTitle = styled(Typography)`
  letter-spacing: 5px;
`;

const App: FunctionComponent = () => {
  const { minimizeWindow, maximizeWindow, closeWindow } = useWindowControls();

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <AppBar position="static">
      <ProminentToolbar>
        <Avatar src="/icon.png" />
        <ToolbarTitle fontSize={"1.25rem"}>LAN - Launcher</ToolbarTitle>
        <IconButton onClick={minimizeWindow}>
          <Icon path={mdiWindowMinimize} size={1} />
        </IconButton>
        <IconButton onClick={maximizeWindow}>
          <Icon path={mdiWindowMaximize} size={1} />
        </IconButton>
        <IconButton onClick={closeWindow}>
          <Icon path={mdiClose} size={1} />
        </IconButton>
      </ProminentToolbar>
    </AppBar>
  );
};

const root = createRoot(document.getElementById("app"));
root.render(
  <StrictMode>
    <SettingsServiceContextProvider>
      <SyncServiceContextProvider>
        <CustomThemeProvider>
          <CssBaseline />
          <App />
        </CustomThemeProvider>
      </SyncServiceContextProvider>
    </SettingsServiceContextProvider>
  </StrictMode>
);
