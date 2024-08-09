import { AxiosResponse } from "axios";
import { createContext } from "react";

export const SyncServiceContext = createContext<{
  started: boolean;
  online: boolean;
  folders: Folder[];
  folderStatuses: Record<string, FolderStatus>;
  getDiscovery: () => Promise<AxiosResponse<unknown>>;
  revertFolder: (id: string) => Promise<void>;
  downloadGame: (gameConfig: Game) => Promise<void>;
  unPauseGame: (folder: Folder, pause: boolean) => Promise<void>;
  deleteGame: (folder: Folder) => Promise<void>;
}>(null);
