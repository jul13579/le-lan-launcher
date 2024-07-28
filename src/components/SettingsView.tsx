import { Alert, Box, Container, styled, Theme } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsService } from "../hooks/useSettingsService";
import { bgTransparentDarkWithBlur } from "../App";
import { mdiImageSearch } from "@mdi/js";
import Icon from "@mdi/react";
import { useFileChooser } from "../hooks/useFileChooser";

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
  const { playerName, homeDir, nas, backgroundHue, setTheme } =
    useSettingsService();
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

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Container>
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
    </Container>
  );
};
