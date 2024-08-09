import { useMemo } from "react";
import { useSyncService } from "./useSyncService";

export const useGameFolder = (gameConfig: Game): [Folder, FolderStatus] => {
  const { folders, folderStatuses } = useSyncService();

  const thisGameFolder = useMemo(
    () => folders.find(({ id }) => id === gameConfig.id),
    [folders]
  );
  const thisGameFolderStatus = useMemo(
    () => folderStatuses[gameConfig.id],
    [folderStatuses]
  );

  return [thisGameFolder, thisGameFolderStatus];
};
