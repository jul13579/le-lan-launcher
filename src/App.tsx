import {
  mdiClose,
  mdiCog,
  mdiGamepad,
  mdiWindowMaximize,
  mdiWindowMinimize,
} from "@mdi/js";
import Icon from "@mdi/react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonProps,
  CssBaseline,
  styled,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { FunctionComponent, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { SettingsServiceContextProvider } from "./components/contexts/SettingsService/SettingsServiceContextProvider";
import { SyncServiceContextProvider } from "./components/contexts/SyncService/SyncServiceContextProvider";
import { CustomThemeProvider } from "./components/CustomThemeProvider";
import { useWindowControls } from "./hooks/useWindowControls";
import { useTranslation } from "react-i18next";
import { useSettingsService } from "./hooks/useSettingsService";
import { ThemeBackground } from "./components/ThemeBackground";

const ProminentToolbar = styled(Toolbar)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "1fr 1fr",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(0),
  // Override media queries injected by theme.mixins.toolbar
  "@media all": {
    minHeight: 112,
  },
}));

const AppBarRow = styled(Box)(() => ({
  display: "flex",
  minWidth: "100%",
  justifyContent: "center",
}));

const ToolbarTitle = styled(Typography)(() => ({
  letterSpacing: "5px",
  fontSize: "1.25rem",
  alignSelf: "center",
}));

const AvatarBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  padding: theme.spacing(2),
}));

const WindowButtonsBox = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  right: 0,
}));

const WindowButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  color: theme.palette.text.primary,
}));

const CustomTab = styled(Tab)(() => ({
  minHeight: 50,
  lineHeight: 1,
}));

const App: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { t } = useTranslation();
  const { minimizeWindow, maximizeWindow, closeWindow } = useWindowControls();
  const { setupCompleted } = useSettingsService();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [tab, setTab] = useState(setupCompleted ? 0 : 1);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      <ThemeBackground />
      <AppBar position="static">
        <ProminentToolbar>
          <AppBarRow>
            <AvatarBox>
              <Avatar src="/icon.png" />
            </AvatarBox>
            <ToolbarTitle>LAN - Launcher</ToolbarTitle>
            <WindowButtonsBox>
              {[
                [minimizeWindow, mdiWindowMinimize],
                [maximizeWindow, mdiWindowMaximize],
                [closeWindow, mdiClose, "error"],
              ].map(
                (
                  [cb, icon, color]: [() => void, string, ButtonProps["color"]],
                  index
                ) => (
                  <WindowButton
                    key={index}
                    size="large"
                    color={color}
                    onClick={cb}
                  >
                    <Icon path={icon} size={1} />
                  </WindowButton>
                )
              )}
            </WindowButtonsBox>
          </AppBarRow>
          <AppBarRow>
            <Tabs value={tab} onChange={(event, value) => setTab(value)}>
              {[
                [t("nav.library"), mdiGamepad, !setupCompleted],
                [t("nav.settings"), mdiCog, false],
              ].map(
                ([text, icon, disabled]: [string, string, boolean], index) => (
                  <CustomTab
                    key={index}
                    label={text}
                    disabled={disabled}
                    icon={<Icon path={icon} size={1} />}
                    iconPosition="start"
                  />
                )
              )}
            </Tabs>
          </AppBarRow>
        </ProminentToolbar>
      </AppBar>
    </>
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
