import { Box, styled } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import { useLibrary } from "../hooks/useLibrary";

const hoverAnimation = "0.2s ease-in-out";

interface GameEntryRootProps {
  installed: boolean;
}

const GameEntryRoot = styled("div")<GameEntryRootProps>(
  ({ theme, installed }) => ({
    position: "relative",
    width: "190px",
    overflow: "hidden",
    margin: theme.spacing(1.5),
    // Game image styling
    img: {
      width: "100%",
      height: "auto",
    },
    // Every child element that is not the game thumbnail is absolutely positioned => stacked on each other
    "& > *:not(img)": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    ...(installed
      ? {
          transition: `transform ${hoverAnimation}`,
          cursor: "pointer",
          "&:hover": {
            transform: "perspective(10px) rotateX(0.1deg)",
            ".glass": {
              top: "-70% !important",
            },
          },
        }
      : {}),
  })
);

interface ProgressIndicatorProps {
  downloadProgress: number;
}

const ProgressIndicator = styled("div")<ProgressIndicatorProps>(
  ({ downloadProgress }) => ({
    top: `${-downloadProgress * 100}%`,
  })
);

const Glass = styled("div")(() => ({
  transition: `top ${hoverAnimation}`,
  top: "-175% !important",
  height: "200% !important",
  width: "200% !important",
  boxShadow: "0px 0px 20px 5px white, inset 0px 0px 20px 5px white",
  transform: "rotate(-45deg)",
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
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const downloadProgress = useMemo(() => 1, []);
  const installed = useMemo(() => downloadProgress >= 1, [downloadProgress]);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <GameEntryRoot installed={installed}>
      {/* Game Thumbnail */}
      <img src={`game://${libFolderPath}/${gameConfig.cover}`} />
      <ProgressIndicator downloadProgress={downloadProgress} />
      {downloadProgress < 1 ? <></> : <Glass className="glass" />}
    </GameEntryRoot>
  );
};
