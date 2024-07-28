import { createContext } from "react";

export const SyncServiceContext = createContext<{
  started: boolean;
  online: boolean;
}>(null);
