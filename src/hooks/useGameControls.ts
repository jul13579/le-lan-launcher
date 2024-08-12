import { useMemo } from "react";
import GameOperations from "../enums/GameOperations";
import { useSyncService } from "./useSyncService";
import { useSettingsService } from "./useSettingsService";
import { useDebugModal } from "./useDebugModal";

export const useGameControls = (folder: Folder, gameConfig: Game) => {
  const { downloadGame, unPauseGame, deleteGame, revertFolder } =
    useSyncService();
  const { playerName, debug } = useSettingsService();
  const { openDebugDialog, clearMessages } = useDebugModal();

  return useMemo(() => {
    const download = () => downloadGame(gameConfig);
    const pause = () => unPauseGame(folder, true);
    const resume = () => unPauseGame(folder, false);
    const execute = (executable: string) => {
      if (debug) {
        clearMessages();
        openDebugDialog();
      }
      window.ipcRenderer.invoke(
        "controlGame",
        GameOperations.LAUNCH,
        folder,
        gameConfig,
        executable,
        playerName,
        debug,
      );
    };
    const reset = () => {
      revertFolder(folder.id);
    };
    const browse = () => {
      window.ipcRenderer.invoke("controlGame", GameOperations.BROWSE, folder);
    };

    return { download, pause, resume, execute, reset, browse };
  }, [
    folder,
    gameConfig,
    playerName,
    debug,
    downloadGame,
    unPauseGame,
    deleteGame,
    revertFolder,
  ]);
};
