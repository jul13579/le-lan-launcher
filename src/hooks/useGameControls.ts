import { useMemo } from "react";
import GameOperations from "../enums/GameOperations";
import { useSyncService } from "./useSyncService";
import { useSettingsService } from "./useSettingsService";
import { useDebugModal } from "./useDebugModal";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useGameControls = (folder: Folder, gameConfig: Game) => {
  const { downloadGame, unPauseGame, deleteGame, revertFolder } =
    useSyncService();
  const { playerName, debug } = useSettingsService();
  const { openDebugDialog, clearMessages } = useDebugModal();
  const { t } = useTranslation();

  const { title: gameTitle } = gameConfig;

  return useMemo(() => {
    const download = async () => {
      await downloadGame(gameConfig);
      toast(t("toast.download.started", { gameTitle }), {
        type: "success",
      });
    };
    const pause = async () => {
      await unPauseGame(folder, true);
      toast(t("toast.download.paused", { gameTitle }), { type: "success" });
    };
    const resume = async () => {
      await unPauseGame(folder, false);
      toast(t("toast.download.resumed", { gameTitle }), { type: "success" });
    };
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
    const reset = async () => {
      await revertFolder(folder.id);
      toast(t("toast.game.reset", { gameTitle }), { type: "success" });
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
