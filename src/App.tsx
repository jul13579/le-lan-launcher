import {
  mdiClose,
  mdiCog,
  mdiGamepad,
  mdiWindowMaximize,
  mdiWindowMinimize,
} from "@mdi/js";
import { default as Icon } from "@mdi/react";
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
import { useTranslation } from "react-i18next";
import { LibraryContextProvider } from "./components/contexts/Library/LibraryContextProvider";
import { SettingsServiceContextProvider } from "./components/contexts/SettingsService/SettingsServiceContextProvider";
import { SyncServiceContextProvider } from "./components/contexts/SyncService/SyncServiceContextProvider";
import {
  bgTransparentDarkWithBlur,
  CustomThemeProvider,
} from "./components/CustomThemeProvider";
import { GamesView } from "./components/GamesView";
import { GlobalStyles } from "./components/GlobalStyles";
import { ServiceStatistics } from "./components/ServiceStatistics";
import { SettingsView } from "./components/SettingsView";
import { ThemeBackground } from "./components/ThemeBackground";
import { TabValue } from "./enums/TabValue";
import { useSettingsService } from "./hooks/useSettingsService";
import { useWindowControls } from "./hooks/useWindowControls";
import { ToastContainer } from "./components/ToastContainer";
import { TabPanelContainer } from "./components/TabPanel";

const noDrag = {
  WebkitAppRegion: "no-drag",
};

export const appBarHeight = 116;

const DraggableAppBar = styled(AppBar)(() => ({
  ...bgTransparentDarkWithBlur,
  WebkitAppRegion: "drag",
  height: appBarHeight,
}));

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
  userSelect: "none",
}));

const AvatarBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  padding: theme.spacing(2),
}));

const WindowButtonsBox = styled(Box)(() => ({
  ...noDrag,
  position: "absolute",
  top: 0,
  right: 0,
}));

const WindowButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  color: theme.palette.text.primary,
}));

const NonDraggableTabs = styled(Tabs)(() => ({
  ...noDrag,
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
  const [tab, setTab] = useState(
    setupCompleted ? TabValue.GAMES : TabValue.SETTINGS,
  );

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      <ThemeBackground />
      <DraggableAppBar>
        <ProminentToolbar>
          <AppBarRow>
            <AvatarBox>
              <Avatar src="./icon.png" />
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
                  index,
                ) => (
                  <WindowButton
                    key={index}
                    size="large"
                    color={color}
                    onClick={cb}
                  >
                    <Icon path={icon} size={1} />
                  </WindowButton>
                ),
              )}
            </WindowButtonsBox>
          </AppBarRow>
          <AppBarRow>
            <NonDraggableTabs
              value={tab}
              onChange={(event, value) => setTab(value)}
            >
              {[
                [TabValue.GAMES, t("nav.library"), mdiGamepad, !setupCompleted],
                [TabValue.SETTINGS, t("nav.settings"), mdiCog, false],
              ].map(
                (
                  [tabValue, text, icon, disabled]: [
                    string,
                    string,
                    string,
                    boolean,
                  ],
                  index,
                ) => (
                  <CustomTab
                    key={index}
                    value={tabValue}
                    label={text}
                    disabled={disabled}
                    icon={<Icon path={icon} size={1} />}
                    iconPosition="start"
                  />
                ),
              )}
            </NonDraggableTabs>
          </AppBarRow>
        </ProminentToolbar>
      </DraggableAppBar>
      <TabPanelContainer>
        <GamesView value={tab} />
        <SettingsView value={tab} />
      </TabPanelContainer>
      <ServiceStatistics />
      <ToastContainer />
    </>
  );
};

const root = createRoot(document.getElementById("app"));
root.render(
  <StrictMode>
    <SettingsServiceContextProvider>
      <SyncServiceContextProvider>
        <LibraryContextProvider>
          <CustomThemeProvider>
            <CssBaseline />
            <GlobalStyles />
            <App />
          </CustomThemeProvider>
        </LibraryContextProvider>
      </SyncServiceContextProvider>
    </SettingsServiceContextProvider>
  </StrictMode>,
);
