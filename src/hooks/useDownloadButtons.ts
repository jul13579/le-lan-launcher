import {
  mdiChevronDoubleRight,
  mdiClose,
  mdiDownload,
  mdiPause,
} from "@mdi/js";
import { useMemo } from "react";
import { useGameControls } from "./useGameControls";

export const useDownloadButtons = (
  subscribed: boolean,
  thisGameFolder: Folder,
  gameConfig: Game,
  openDeleteDialog: () => void,
) => {
  const { download, pause, resume } = useGameControls(
    thisGameFolder,
    gameConfig,
  );

  return useMemo(
    () => [
      { click: download, show: !subscribed, icon: mdiDownload },
      {
        click: pause,
        show: thisGameFolder && !thisGameFolder.paused,
        icon: mdiPause,
      },
      {
        click: resume,
        show: thisGameFolder && thisGameFolder.paused,
        icon: mdiChevronDoubleRight,
      },
      { click: openDeleteDialog, show: subscribed, icon: mdiClose },
    ],
    [subscribed, thisGameFolder, download, pause, resume, openDeleteDialog],
  );
};
