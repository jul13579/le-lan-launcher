import { Alert, Box, Container } from "@mui/material";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsService } from "../hooks/useSettingsService";

export const SettingsView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { t } = useTranslation();
  const { playerName, homeDir, nas } = useSettingsService();

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
          <Box m={1}>
            <Alert severity="error">{text}</Alert>
          </Box>
        ))}
    </Container>
  );
};
