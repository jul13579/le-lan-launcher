import { mdiClose, mdiWindowMaximize, mdiWindowMinimize } from "@mdi/js";
import Icon from "@mdi/react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
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

const ToolbarTitle = styled(Typography)(() => ({
  letterSpacing: "5px",
  fontSize: "1.25rem",
  alignSelf: "center",
}));

const App: FunctionComponent = () => {
  const { minimizeWindow, maximizeWindow, closeWindow } = useWindowControls();

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <AppBar position="static">
      <ProminentToolbar>
        <Box
          display={"flex"}
          minWidth={"100%"}
          justifyContent={"center"}
        >
          <Box position={"absolute"} top={0} left={0}>
            <Avatar src="/icon.png" />
          </Box>
          <ToolbarTitle
            letterSpacing={"5px"}
            fontSize={"1.25rem"}
            alignSelf={"center"}
          >
            LAN - Launcher
          </ToolbarTitle>
          <Box position={"absolute"} top={0} right={0}>
            <Button
              size="large"
              sx={{ borderRadius: 0 }}
              onClick={minimizeWindow}
            >
              <Icon path={mdiWindowMinimize} size={1} />
            </Button>
            <Button
              size="large"
              sx={{ borderRadius: 0 }}
              onClick={maximizeWindow}
            >
              <Icon path={mdiWindowMaximize} size={1} />
            </Button>
            <Button
              size="large"
              color="error"
              sx={{ borderRadius: 0 }}
              onClick={closeWindow}
            >
              <Icon path={mdiClose} size={1} />
            </Button>
          </Box>
        </Box>
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
