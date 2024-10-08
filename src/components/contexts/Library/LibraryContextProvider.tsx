import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LibraryContext } from "./LibraryContext";
import { useLibraryWatcher } from "src/hooks/useLibraryWatcher";
import { useSyncService } from "src/hooks/useSyncService";
import { gamelibConfig, gamelibDirId } from "src/config/folder";
import { useSettingsService } from "src/hooks/useSettingsService";
import { IpcRenderer } from "electron";
import { localPathToPathname } from "../../../utils/localPathToPathname";

interface LibraryContextProviderProps {
  children: ReactNode;
}

export const LibraryContextProvider: FunctionComponent<
  LibraryContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { homeDirWithForwardSlash } = useSettingsService();
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
    [folders],
  );
  const libFolderPath = useMemo(() => {
    if (!libFolder) return undefined;
    return `${homeDirWithForwardSlash}/${libFolder.label}`;
  }, [libFolder]);
  const libConfigPath = useMemo(() => {
    if (!libFolderPath) return undefined;
    return `${libFolderPath}/${gamelibConfig}`;
  }, [libFolderPath]);
  const libFolderPathname = useMemo(
    () => libFolderPath && localPathToPathname(libFolderPath),
    [libFolderPath],
  );

  /* -------------------------------------------------------------------------- */
  /*                             Instance Lifecycle                             */
  /* -------------------------------------------------------------------------- */
  /**
   * Request (un)watching of library directory when `libConfigPath` changes
   */
  useEffect(() => {
    if (!libConfigPath) return;
    const handler: Parameters<IpcRenderer["on"]>[1] = (event, lib: Library) =>
      setLib(lib);
    watch(libConfigPath, handler);
    return () => unwatch(libConfigPath);
  }, [libConfigPath]);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {
    lib,
    libFolderPathname,
  };
  return (
    <LibraryContext.Provider value={state}>{children}</LibraryContext.Provider>
  );
};
