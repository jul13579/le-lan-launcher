import { AxiosResponse } from "axios";
import { createContext } from "react";

export const SyncServiceContext = createContext<{
  started: boolean;
  online: boolean;
  getDiscovery: () => Promise<AxiosResponse<unknown>>;
}>(null);
