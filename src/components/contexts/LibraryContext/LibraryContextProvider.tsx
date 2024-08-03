import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { gamelibConfig, gamelibDirId } from "../../../config/folder";
import { useLibraryWatcher } from "../../../hooks/useLibraryWatcher";
import { useSettingsService } from "../../../hooks/useSettingsService";
import { useSyncService } from "../../../hooks/useSyncService";
import { LibraryContext } from "./LibraryContext";

interface LibraryContextProviderProps {
  children: ReactNode;
}

export const LibraryContextProvider: FunctionComponent<
  LibraryContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { homeDir } = useSettingsService();
  const { folders } = useSyncService();
  const { watch, unwatch } = useLibraryWatcher();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * Define state attributes for library data
   */
  const [lib, setLib] = useState<Library>(undefined);
  const libFolder = useMemo(
    () => folders.find((folder) => folder.id === gamelibDirId),
    [folders]
  );
  const libFolderPath = useMemo(() => {
    if (!libFolder) return undefined;
    return `${homeDir}/${libFolder.label}`;
  }, [libFolder]);
  const libConfigPath = useMemo(() => {
    if (!libFolderPath) return undefined;
    return `${libFolderPath}/${gamelibConfig}`;
  }, [libFolderPath]);

  /* -------------------------------------------------------------------------- */
  /*                             Instance Lifecycle                             */
  /* -------------------------------------------------------------------------- */
  /**
   * Request (un)watching of library directory when `libConfigPath` changes
   */
  useEffect(() => {
    if (!libConfigPath) return;
    watch(libConfigPath, (event, lib) => setLib(lib));
    return () => unwatch(libConfigPath);
  }, [libConfigPath]);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {};
  return (
    <LibraryContext.Provider value={state}>{children}</LibraryContext.Provider>
  );
};
