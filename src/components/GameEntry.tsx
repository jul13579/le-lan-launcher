import {
  Box,
  Fab,
  ListItemIcon,
  Menu,
  MenuItem,
  styled,
  Typography,
} from "@mui/material";
import {
  FunctionComponent,
  MouseEvent,
  MouseEventHandler,
  useMemo,
  useState,
} from "react";
import { useLibrary } from "../hooks/useLibrary";
import { useSyncService } from "../hooks/useSyncService";
import Icon from "@mdi/react";
import {
  mdiBackupRestore,
  mdiChevronDoubleRight,
  mdiClose,
  mdiDelete,
  mdiDotsHorizontal,
  mdiDownload,
  mdiFolderOpen,
  mdiPause,
  mdiPlay,
} from "@mdi/js";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
    [subscribed, thisGameFolder]
  );

  const gameMenuButtons = useMemo(
    () => [
      {
        click: () => execute,
        show: true,
        icon: mdiPlay,
        text: t("gameEntry.play"),
      },
      ...(gameConfig.moreLaunchs || []).map((item) => ({
        click: () => execute,
        show: true,
        icon: mdiDotsHorizontal,
        text: item.text,
      })),
      {
        click: () => pause,
        show: thisGameFolder?.paused,
        icon: mdiPause,
        text: t("gameEntry.pause"),
      },
      {
        click: () => resume,
        show: thisGameFolder?.paused,
        icon: mdiChevronDoubleRight,
        text: t("gameEntry.resume"),
      },
      {
        click: () => reset,
        show: thisGameFolderStatus?.receiveOnlyTotalItems > 0,
        icon: mdiBackupRestore,
        text: t("gameEntry.reset"),
      },
      {
        click: () => browse,
        show: true,
        icon: mdiFolderOpen,
        text: t("gameEntry.browse"),
      },
      {
        click: () => remove,
        show: true,
        icon: mdiDelete,
        text: t("gameEntry.delete"),
      },
    ],
    [thisGameFolder, thisGameFolderStatus, t]
  );

  const [anchorEl, setAnchorEl] = useState(null);

  /* -------------------------------------------------------------------------- */
  /*                             Instance functions                             */
  /* -------------------------------------------------------------------------- */
  const download = () => {};
  const pause = () => {};
  const resume = () => {};
  const remove = () => {};
  const execute = () => {};
  const reset = () => {};
  const browse = () => {};

  const handleMenuOpenClick = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      <GameEntryRoot installed={installed} onClick={handleMenuOpenClick}>
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

      {/* Game Menu */}
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {gameMenuButtons.map(
          ({ click, show, icon, text }, index) =>
            show && (
              <MenuItem key={index} onClick={click}>
                <ListItemIcon>
                  <Icon path={icon} size={1} />
                </ListItemIcon>
                <Typography mx={1}>{text}</Typography>
              </MenuItem>
            )
        )}
      </Menu>
    </>
  );
};
