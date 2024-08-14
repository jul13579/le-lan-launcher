import { mdiDatabaseSearch, mdiImageSearch } from "@mdi/js";
import { default as Icon } from "@mdi/react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  styled,
  Switch,
  TextField,
  Theme,
  Tooltip,
} from "@mui/material";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomTabPanel, TabPanelComponentProps } from "../App";
import { TabValue } from "../enums/TabValue";
import { useFileChooser } from "../hooks/useFileChooser";
import { useSettingsService } from "../hooks/useSettingsService";
import { useSyncService } from "../hooks/useSyncService";
import { bgTransparentDarkWithBlur } from "./CustomThemeProvider";
import { footerHeight } from "./ServiceStatistics";

const ThemeItem = ({ theme }: { theme: Theme }) => ({
  margin: theme.spacing(3),
  borderRadius: 10,
  cursor: "pointer",
  display: "flex",
  height: 200,
  maxHeight: 200,
  width: 200,
  maxWidth: 200,
  transition: "transform 0.1s ease-in-out",

  ":hover": {
    transform: "scale(1.1)",
  },
});

const PredefinedThemeItem = styled("img")(ThemeItem);

interface CustomBackgroundPickerProps {
  hue: number;
}
const CustomBackgroundPicker = styled("div")<CustomBackgroundPickerProps>(
  ({ hue: hue, theme }) => ({
    ...ThemeItem({ theme }),
    ...bgTransparentDarkWithBlur,
    border: `1px solid hsl(${hue}, 100%, 35%)`,
    alignItems: "center",
    justifyContent: "center",
  }),
);

/**
 * The Settings View Tab.
 * This wraps the {@link SettingsView} into a tab panel. This way, the {@link SettingsView} hooks are not run if the
 * tab panel is not active.
 * @returns {FunctionComponent}
 */
const SettingsViewTab: FunctionComponent<TabPanelComponentProps> = ({
  value,
}) => {
  return (
    <CustomTabPanel value={value} match={TabValue.SETTINGS}>
      <SettingsView />
    </CustomTabPanel>
  );
};

export { SettingsViewTab as SettingsView };

/**
 * The Settings View.
 * This component implements the settings page, were users are able to configure the launcher.
 * @returns {FunctionComponent}
 */
const SettingsView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const {
    t,
    i18n: {
      options: { resources: langs },
    },
  } = useTranslation();
  const {
    playerName,
    homeDir,
    nas,
    backgroundHue,
    locale,
    debug,
    setTheme,
    setBackgroundHue,
    setLocale,
    setDebug,
    setPlayerName,
    setHomeDir,
    setNas,
  } = useSettingsService();
  const { started, online, getDiscovery } = useSyncService();
  const { openFileChooser } = useFileChooser();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [devices, setDevices] = useState({});

  /* -------------------------------------------------------------------------- */
  /*                             Instance Lifecycle                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    async function discoveryTask() {
      try {
        const response = await getDiscovery();
        setDevices(response.data);
      } catch (e) {
        // Do nothing
      }
    }
    let discoveryInterval: ReturnType<typeof setInterval>;
    if (online) {
      discoveryInterval = setInterval(discoveryTask, 1000);
    }
    return () => discoveryInterval && clearInterval(discoveryInterval);
  }, [online]);

  /* -------------------------------------------------------------------------- */
  /*                             Instance Functions                             */
  /* -------------------------------------------------------------------------- */
  function selectCustomBackground() {
    openFileChooser(
      (result) => {
        setTheme({
          path: `legc://${result.filePaths[0].replace(/\\/g, "/")}`,
          cover: true,
        });
      },
      {
        properties: ["openFile"],
        filters: [
          {
            name: t("settings.images"),
            extensions: ["jpg", "jpeg", "png"],
          },
        ],
      },
    );
  }

  function selectHomeDir() {
    openFileChooser(
      (result) => {
        setHomeDir(result.filePaths[0]);
      },
      { properties: ["openDirectory"] },
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Container maxWidth={"xl"}>
      {/* Alerts */}
      {[
        [!playerName, t("errors.playerNameUnset.message")],
        [!homeDir, t("errors.homeDirUnset.message")],
        [!nas, t("errors.nasUnset.message")],
      ]
        .filter(([visible]) => !!visible)
        .map(([, text], index) => (
          <Box key={index} my={1}>
            <Alert severity="error">{text}</Alert>
          </Box>
        ))}

      {/* Theme */}
      <h1>{t("settings.theme")}</h1>
      <Box display={"flex"} flexWrap={"wrap"}>
        {[
          "./funky-lines.png",
          "./gaming.png",
          "./prism.png",
          "./maze.png",
          "./unicorns.png",
        ].map((texture, index) => (
          <PredefinedThemeItem
            key={index}
            src={texture}
            onClick={() => setTheme({ path: texture, cover: false })}
          />
        ))}
        <CustomBackgroundPicker
          hue={backgroundHue}
          onClick={selectCustomBackground}
        >
          <Icon path={mdiImageSearch} size={2} />
        </CustomBackgroundPicker>
      </Box>

      {/* Background Hue Slider */}
      <h1>{t("settings.backgroundHue")}</h1>
      <Slider
        min={0}
        max={360}
        valueLabelDisplay="auto"
        value={backgroundHue}
        onChange={(event, value: number) => setBackgroundHue(value)}
      />

      {/* Environment */}
      <h1>{t("settings.environment")}</h1>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">
              {t("settings.language")}
            </InputLabel>
            <Select
              labelId="language-select-label"
              label={t("settings.language")}
              value={locale}
              onChange={(event) => setLocale(event.target.value)}
            >
              {Object.keys(langs).map((lang, index) => (
                <MenuItem key={index} value={lang}>
                  {t(`langs.${lang}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} />
        <Grid item xs={3}>
          <Box display={"flex"} minHeight={"100%"}>
            <Tooltip title={t("settings.debug_explanation")}>
              <FormControlLabel
                label={t("settings.debug")}
                control={
                  <Switch
                    checked={debug}
                    onChange={(event, checked) => setDebug(checked)}
                  />
                }
              />
            </Tooltip>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            label={t("settings.playerName")}
            value={playerName}
            error={!playerName}
            onChange={(event) => setPlayerName(event.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <Box display={"flex"} minWidth={"100%"} minHeight={"100%"}>
            <TextField
              fullWidth
              label={t("settings.homeDir")}
              value={homeDir}
              disabled={true}
              error={!homeDir}
              InputLabelProps={{ disabled: false, shrink: !!homeDir }}
              InputProps={{
                endAdornment: (
                  <Button onClick={selectHomeDir} disabled={started}>
                    <Icon path={mdiDatabaseSearch} size={1} />
                  </Button>
                ),
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <InputLabel id="nas-select-label">{t("settings.nas")}</InputLabel>
            <Select
              labelId="nas-select-label"
              label={t("settings.nas")}
              value={nas}
              onChange={(event) =>
                event.target.value !== "-1" && setNas(event.target.value)
              }
              error={!nas}
              MenuProps={{
                marginThreshold: footerHeight,
              }}
            >
              {useCallback(() => {
                const deviceIds = Object.keys(devices);
                if (deviceIds.length > 0) {
                  return deviceIds.map((deviceId, index) => (
                    <MenuItem key={index} value={deviceId}>
                      {deviceId}
                    </MenuItem>
                  ));
                } else if (nas) {
                  return <MenuItem value={nas}>{nas}</MenuItem>;
                } else if (!online) {
                  return (
                    <MenuItem value={"-1"}>
                      {t("settings.alerts.service")}
                    </MenuItem>
                  );
                } else {
                  return (
                    <MenuItem value={"-1"}>
                      {t("settings.alerts.discovery")}
                    </MenuItem>
                  );
                }
              }, [devices, nas, online])()}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Container>
  );
};
