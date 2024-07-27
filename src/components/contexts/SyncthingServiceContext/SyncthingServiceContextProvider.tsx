import { FunctionComponent, ReactNode } from "react";
import { SyncthingServiceContext } from "./SyncthingServiceContext";

interface SyncthingServiceContextProviderProps {
  children: ReactNode;
}

const SyncthingServiceContextProvider: FunctionComponent<
  SyncthingServiceContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {};
  return (
    <SyncthingServiceContext.Provider value={state}>
      {children}
    </SyncthingServiceContext.Provider>
  );
};

export { SyncthingServiceContextProvider };
