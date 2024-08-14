import { Box, Container, styled } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import { SelfBuildingSquareSpinner } from "react-epic-spinners";
import { useTranslation } from "react-i18next";
import { useLibrary } from "../hooks/useLibrary";
import { useSettingsService } from "../hooks/useSettingsService";
import { GameEntry } from "./GameEntry";
import { CustomTabPanel, TabPanelComponentProps } from "../App";
import { TabValue } from "../enums/TabValue";
import { DebugModalContextProvider } from "./contexts/DebugModal/DebugModalContextProvider";

const GameGridContainer = styled(Container)(() => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  userSelect: "none",
}));

export const GamesView: FunctionComponent<TabPanelComponentProps> = ({
  value,
}) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { primaryColorHex } = useSettingsService();
  const { lib } = useLibrary();
  const { t } = useTranslation();

  const loading = useMemo(() => !lib?.games, [lib]);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <CustomTabPanel value={value} match={TabValue.GAMES} fullHeight={loading}>
      {loading ? (
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
      ) : (
        <GameGridContainer maxWidth={"xl"}>
          <DebugModalContextProvider>
            {lib.games.map((game, index) => (
              <GameEntry key={index} gameConfig={game} />
            ))}
          </DebugModalContextProvider>
        </GameGridContainer>
      )}
    </CustomTabPanel>
  );
};
