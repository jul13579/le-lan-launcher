import { FunctionComponent } from "react";
import { useLibrary } from "../hooks/useLibrary";
import { Box } from "@mui/material";
import { GameEntry } from "./GameEntry";

export const GamesView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { lib } = useLibrary();

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
