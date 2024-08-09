import { Box, Container, styled } from "@mui/material";
import { FunctionComponent } from "react";
import { SelfBuildingSquareSpinner } from "react-epic-spinners";
import { useTranslation } from "react-i18next";
import { useLibrary } from "../hooks/useLibrary";
import { useSettingsService } from "../hooks/useSettingsService";
import { GameEntry } from "./GameEntry";

const GameGridContainer = styled(Container)(() => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
}));

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
      <Box
        display={"flex"}
        flexDirection={"column"}
        height={"100%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <SelfBuildingSquareSpinner
          animationDuration={6000}
          size={100}
          color={primaryColorHex}
        />
        <h3>{t("games.lib_loading")}</h3>
      </Box>
    );
  }
  return (
    <GameGridContainer>
      {lib.games.map((game, index) => (
        <GameEntry key={index} gameConfig={game} />
      ))}
    </GameGridContainer>
  );
};
