import { AxiosResponse } from "axios";
import { createContext } from "react";

export const SyncServiceContext = createContext<{
  started: boolean;
  online: boolean;
  folders: Folder[];
  folderStatuses: Record<string, FolderStatus>;
  getDiscovery: () => Promise<AxiosResponse<unknown>>;
  revertFolder: (id: string) => Promise<AxiosResponse<unknown>>;
  downloadGame: (gameConfig: Game) => Promise<AxiosResponse<unknown>>;
  unPauseGame: (
    folder: Folder,
    pause: boolean,
  ) => Promise<AxiosResponse<unknown>>;
  deleteGame: (folder: Folder) => Promise<AxiosResponse<unknown>>;
}>(null);
