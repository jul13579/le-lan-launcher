import { useMemo } from "react";
import GameOperations from "../enums/GameOperations";
import { useSyncService } from "./useSyncService";
import { useSettingsService } from "./useSettingsService";

export const useGameControls = (folder: Folder, gameConfig: Game) => {
  const { downloadGame, unPauseGame, deleteGame, revertFolder } =
    useSyncService();
  const { playerName, debug } = useSettingsService();

  return useMemo(() => {
    const download = () => downloadGame(gameConfig);
    const pause = () => unPauseGame(folder, true);
    const resume = () => unPauseGame(folder, false);
    const remove = () => deleteGame(folder);
    const execute = (executable: string) => {
      // TODO: add debug modal handling
      //   if (this.debug) {
      //     this.debugMessages = [];
      //     this.debugDialog = true;
      //   }
      window.ipcRenderer.invoke(
        "controlGame",
        GameOperations.LAUNCH,
        gameConfig,
        folder,
        executable,
        playerName,
        debug
      );
    };
    const reset = () => {
      revertFolder(folder.id);
    };
    const browse = () => {
      window.ipcRenderer.invoke("controlGame", GameOperations.BROWSE, folder);
    };

    return { download, pause, resume, remove, execute, reset, browse };
  }, [folder]);
};
