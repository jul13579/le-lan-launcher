import { FunctionComponent } from "react";
import { useLibrary } from "../hooks/useLibrary";
import { Box } from "@mui/material";
import { GameEntry } from "./GameEntry";
import { SelfBuildingSquareSpinner } from "react-epic-spinners";
import { useSettingsService } from "../hooks/useSettingsService";
import hslToHex from "hsl-to-hex";
import { useTranslation } from "react-i18next";

export const GamesView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { primaryColorHex } = useSettingsService();
  const { lib } = useLibrary();
  const { t } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  if (!lib?.games) {
    return (
      <Box>
        <SelfBuildingSquareSpinner
          animationDuration={6000}
          size={100}
          color={primaryColorHex}
        />
        <div>{t("games.lib_loading")}</div>
      </Box>
    );
  }
  return (
    <>
      <Box>
        {lib.games.map((game, index) => (
          <GameEntry key={index} gameConfig={game} />
        ))}
      </Box>
    </>
  );
};
