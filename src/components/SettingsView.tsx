import { mdiDatabaseSearch, mdiImageSearch } from "@mdi/js";
import Icon from "@mdi/react";
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
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { bgTransparentDarkWithBlur } from "../App";
import { useFileChooser } from "../hooks/useFileChooser";
import { useSettingsService } from "../hooks/useSettingsService";
import { useSyncService } from "../hooks/useSyncService";
import langs from "../localization/langs";

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
  })
);

export const SettingsView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { t } = useTranslation();
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
  } = useSettingsService();
  const { started } = useSyncService();
  const { openFileChooser } = useFileChooser();

  /* -------------------------------------------------------------------------- */
  /*                             Instance Functions                             */
  /* -------------------------------------------------------------------------- */
  function selectCustomBackground() {
    openFileChooser(
      (result) => {
        setTheme({
          path: `theme://${result.filePaths[0].replace(/\\/g, "/")}`,
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
      }
    );
  }

  function selectHomeDir() {
    openFileChooser(
      (result) => {
        setHomeDir(result.filePaths[0]);
      },
      { properties: ["openDirectory"] }
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Container>
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
                    value={debug}
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
              onClick={selectHomeDir}
              InputLabelProps={{ disabled: false }}
            />
            <Button onClick={selectHomeDir} disabled={started}>
              <Icon path={mdiDatabaseSearch} size={1} />
            </Button>
          </Box>
        </Grid>
        <Grid item xs={5}></Grid>
      </Grid>
    </Container>
  );
};
