import { AxiosResponse } from "axios";
import { createContext } from "react";

export const SyncServiceContext = createContext<{
  started: boolean;
  online: boolean;
  folders: Folder[];
  getDiscovery: () => Promise<AxiosResponse<unknown>>;
}>(null);
