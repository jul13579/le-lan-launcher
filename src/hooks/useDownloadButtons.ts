import { useMemo } from "react";
import { useGameControls } from "./useGameControls";
import {
  mdiChevronDoubleRight,
  mdiClose,
  mdiDownload,
  mdiPause,
} from "@mdi/js";

export const useDownloadButtons = (
  subscribed: boolean,
  thisGameFolder: Folder,
  gameConfig: Game
) => {
  const { download, pause, resume, remove } = useGameControls(
    thisGameFolder,
    gameConfig
  );

  return useMemo(
    () => [
      { click: download, show: !subscribed, icon: mdiDownload },
      { click: pause, show: thisGameFolder?.paused, icon: mdiPause },
      {
        click: resume,
        show: thisGameFolder?.paused,
        icon: mdiChevronDoubleRight,
      },
      { click: remove, show: subscribed, icon: mdiClose },
    ],
    [subscribed, thisGameFolder]
  );
};
