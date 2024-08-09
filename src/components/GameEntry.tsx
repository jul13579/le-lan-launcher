import { Box, Fab, styled } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import { useLibrary } from "../hooks/useLibrary";
import { useSyncService } from "../hooks/useSyncService";
import Icon from "@mdi/react";
import {
  mdiChevronDoubleRight,
  mdiClose,
  mdiDownload,
  mdiPause,
} from "@mdi/js";

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

const DownloadButtonsContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

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
  const { folders, folderStatuses } = useSyncService();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const thisGameFolder = useMemo(
    () => folders.find(({ id }) => id === gameConfig.id),
    [folders]
  );
  const thisGameFolderStatus = useMemo(
    () => folderStatuses[gameConfig.id],
    [folderStatuses]
  );
  const subscribed = useMemo(() => !!thisGameFolder, [thisGameFolder]);
  const downloadProgress = useMemo(
    () =>
      subscribed && thisGameFolderStatus?.globalBytes > 0
        ? thisGameFolderStatus?.inSyncBytes / thisGameFolderStatus?.globalBytes
        : 0,
    []
  );
  const installed = useMemo(() => downloadProgress >= 1, [downloadProgress]);

  const downloadButtons = useMemo(
    () => [
      { click: () => download, show: !subscribed, icon: mdiDownload },
      { click: () => pause, show: thisGameFolder?.paused, icon: mdiPause },
      {
        click: () => resume,
        show: thisGameFolder?.paused,
        icon: mdiChevronDoubleRight,
      },
      { click: () => remove, show: subscribed, icon: mdiClose },
    ],
    [gameConfig, subscribed]
  );

  /* -------------------------------------------------------------------------- */
  /*                             Instance functions                             */
  /* -------------------------------------------------------------------------- */
  const download = () => {};
  const pause = () => {};
  const resume = () => {};
  const remove = () => {};

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <GameEntryRoot installed={installed}>
      {/* Game Thumbnail */}
      <img src={`game://${libFolderPath}/${gameConfig.cover}`} />
      {/* Progress indicator */}
      <ProgressIndicator downloadProgress={downloadProgress} />
      {/* Download buttons overlay. Only displayed when downloadProgress < 1, hence not completed */}
      {downloadProgress < 1 ? (
        <DownloadButtonsContainer>
          {subscribed && Object.keys(thisGameFolderStatus).length === 0 ? (
            // If game is subscribed but there is no syncFolderStatus yet, show loader
            <></>
          ) : (
            // Else show applicable download buttons
            <>
              {downloadButtons.map(
                ({ click, show, icon }, index) =>
                  show && (
                    <Fab key={index} onClick={click}>
                      <Icon path={icon} size={1.5} />
                    </Fab>
                  )
              )}
            </>
          )}
        </DownloadButtonsContainer>
      ) : (
        <Glass className="glass" />
      )}
    </GameEntryRoot>
  );
};
