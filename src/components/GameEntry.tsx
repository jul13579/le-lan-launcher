import Icon from "@mdi/react";
import {
  Box,
  CircularProgress,
  Fab,
  ListItemIcon,
  Menu,
  MenuItem,
  styled,
  Typography,
} from "@mui/material";
import { FunctionComponent, MouseEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDownloadButtons } from "../hooks/useDownloadButtons";
import { useGameFolder } from "../hooks/useGameFolder";
import { useGameMenuButtons } from "../hooks/useGameMenuButtons";
import { useLibrary } from "../hooks/useLibrary";

const hoverAnimation = "0.2s ease-in-out";

interface GameEntryRootProps {
  installed: boolean;
  thumbnail: string;
}

const GameEntryRoot = styled("div")<GameEntryRootProps>(
  ({ installed, thumbnail }) => ({
    position: "relative",
    width: "190px",
    height: `${190 * 1.5}px`,
    overflow: "hidden",
    // Game image styling
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: "cover",
    // Every child element that is not the game thumbnail is absolutely positioned => stacked on each other
    "& > *": {
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
    background: "rgba(0, 0, 0, 0.7)",
    top: `${-downloadProgress * 100}% !important`,
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

const TextColoredCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.text.primary,
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
  const { t } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [thisGameFolder, thisGameFolderStatus] = useGameFolder(gameConfig);
  const subscribed = useMemo(() => !!thisGameFolder, [thisGameFolder]);
  const downloadProgress = useMemo(
    () =>
      subscribed && thisGameFolderStatus?.globalBytes > 0
        ? thisGameFolderStatus?.inSyncBytes / thisGameFolderStatus?.globalBytes
        : 0,
    [subscribed, thisGameFolderStatus]
  );
  const installed = useMemo(() => downloadProgress >= 1, [downloadProgress]);

  const downloadButtons = useDownloadButtons(
    subscribed,
    thisGameFolder,
    gameConfig
  );

  const gameMenuButtons = useGameMenuButtons(
    thisGameFolder,
    thisGameFolderStatus,
    gameConfig
  );

  const [anchorEl, setAnchorEl] = useState(null);

  /* -------------------------------------------------------------------------- */
  /*                             Instance functions                             */
  /* -------------------------------------------------------------------------- */
  const handleMenuOpenClick = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget.parentElement.nextSibling);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Box display={"flex"} flexDirection={"row"} m={1.5}>
      <GameEntryRoot
        installed={installed}
        thumbnail={`game://${libFolderPath}/${gameConfig.cover}`}
      >
        {/* Progress indicator */}
        <ProgressIndicator downloadProgress={downloadProgress} />
        {/* Download buttons overlay. Only displayed when downloadProgress < 1, hence not completed */}
        {downloadProgress < 1 ? (
          <DownloadButtonsContainer>
            {subscribed && thisGameFolderStatus ? (
              // If game is subscribed but there is no syncFolderStatus yet, show loader
              <Fab>
                <TextColoredCircularProgress size={30} />
              </Fab>
            ) : (
              // Else show applicable download buttons
              downloadButtons.map(
                ({ click, show, icon }, index) =>
                  show && (
                    <Box key={index} m={0.5}>
                      <Fab onClick={click}>
                        <Icon path={icon} size={1.5} />
                      </Fab>
                    </Box>
                  )
              )
            )}
          </DownloadButtonsContainer>
        ) : (
          <Glass className="glass" onClick={handleMenuOpenClick} />
        )}
      </GameEntryRoot>

      {/* Menu anchor helper (such that the menu does not move because of the hover effect) */}
      <div />
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
    </Box>
  );
};
