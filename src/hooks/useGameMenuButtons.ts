import {
  mdiBackupRestore,
  mdiChevronDoubleRight,
  mdiDelete,
  mdiDotsHorizontal,
  mdiFolderOpen,
  mdiPause,
  mdiPlay,
} from "@mdi/js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGameControls } from "./useGameControls";

export const useGameMenuButtons = (
  thisGameFolder: Folder,
  thisGameFolderStatus: FolderStatus,
  gameConfig: Game,
  openDeleteDialog: () => void,
) => {
  const { pause, resume, execute, reset, browse } = useGameControls(
    thisGameFolder,
    gameConfig,
  );
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        click: () => execute(gameConfig.launch.exe),
        show: true,
        icon: mdiPlay,
        text: t("gameEntry.play"),
      },
      ...(gameConfig.moreLaunchs || []).map((item) => ({
        click: () => execute(item.exe),
        show: true,
        icon: mdiDotsHorizontal,
        text: item.text,
      })),
      {
        click: pause,
        show: thisGameFolder?.paused,
        icon: mdiPause,
        text: t("gameEntry.pause"),
      },
      {
        click: resume,
        show: thisGameFolder?.paused,
        icon: mdiChevronDoubleRight,
        text: t("gameEntry.resume"),
      },
      {
        click: reset,
        show: thisGameFolderStatus?.receiveOnlyTotalItems > 0,
        icon: mdiBackupRestore,
        text: t("gameEntry.reset"),
      },
      {
        click: browse,
        show: true,
        icon: mdiFolderOpen,
        text: t("gameEntry.browse"),
      },
      {
        click: openDeleteDialog,
        show: true,
        icon: mdiDelete,
        text: t("gameEntry.delete"),
      },
    ],
    [
      thisGameFolder,
      thisGameFolderStatus,
      t,
      pause,
      resume,
      execute,
      reset,
      browse,
      openDeleteDialog,
    ],
  );
};
