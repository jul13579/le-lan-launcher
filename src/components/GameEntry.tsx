import { Box, styled } from "@mui/material";
import { FunctionComponent } from "react";
import { useLibrary } from "../hooks/useLibrary";

const GameEntryRoot = styled(Box)(({ theme }) => ({
  width: "190px",
  overflow: "hidden",
  margin: theme.spacing(1.5),
  img: {
    width: "100%",
    height: "auto",
  },
}));

interface GameEntryProps {
  gameConfig: Game;
}

export const GameEntry: FunctionComponent<GameEntryProps> = ({
  gameConfig,
}) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { libFolderPath } = useLibrary();

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <GameEntryRoot>
      <img src={`game://${libFolderPath}/${gameConfig.cover}`} />
    </GameEntryRoot>
  );
};
