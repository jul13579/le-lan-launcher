import { Alert, Box, Container, styled } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsService } from "../hooks/useSettingsService";

const ThemeItem = styled("img")(({ theme }) => ({
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
}));

export const SettingsView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { t } = useTranslation();
  const { playerName, homeDir, nas, setTheme } = useSettingsService();

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
        .map(([, text]) => (
          <Box my={1}>
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
        ].map((texture) => (
          <ThemeItem
            src={texture}
            onClick={() => setTheme({ path: texture, cover: false })}
          />
        ))}
      </Box>
    </Container>
  );
};
