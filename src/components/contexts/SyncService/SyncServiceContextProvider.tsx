import axios from "axios";
import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { gamelibDirId } from "src/config/folder";
import { baseUrl } from "src/config/service";
import GameOperations from "src/enums/GameOperations";
import SyncEvents from "src/enums/SyncEvents";
import SyncServiceOperations from "src/enums/SyncServiceOperations";
import { useSettingsService } from "src/hooks/useSettingsService";
import { calculateDownloadProgress } from "src/utils/calculateDownloadProgress";
import { SyncServiceContext } from "./SyncServiceContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useSwallowFirstEffect } from "src/hooks/useSwallowFirstEffect";

const apiBase = `${baseUrl}/rest`;

const SyncthingAPI = {
  System: {
    restart() {
      return axios.post(`${apiBase}/system/restart`);
    },
    stop() {
      return axios.post(`${apiBase}/system/shutdown`);
    },
    ping() {
      return axios.get(`${apiBase}/system/ping`);
    },
    status() {
      return axios.get(`${apiBase}/system/status`);
    },
    getConfig() {
      return axios.get<{ devices: Device[]; folders: Folder[] }>(
        `${apiBase}/system/config`,
      );
    },
    connections() {
      return axios.get<Connections>(`${apiBase}/system/connections`);
    },
    getDiscovery() {
      return axios.get(`${apiBase}/system/discovery`);
    },
  },
  Config: {
    getDeviceTemplate() {
      return axios.get<Device>(`${apiBase}/config/defaults/device`);
    },
    getFolderTemplate() {
      return axios.get<Folder>(`${apiBase}/config/defaults/folder`);
    },
    setDevice(device: Device) {
      return axios.post(`${apiBase}/config/devices`, device);
    },
    setFolder(folder: Folder) {
      return axios.post(`${apiBase}/config/folders`, folder);
    },
    deleteFolder(folder: Folder) {
      return axios.delete(`${apiBase}/config/folders/${folder.id}`);
    },
  },
  DB: {
    folderStatus(folderID: string) {
      return axios.get(`${apiBase}/db/status?folder=${folderID}`);
    },
    revertFolder(folderID: string) {
      return axios.post(`${apiBase}/db/revert?folder=${folderID}`);
    },
  },
  Cluster: {
    getPendingFolders() {
      return axios.get<PendingFolders>(`${apiBase}/cluster/pending/folders`);
    },
  },
  Events: {
    since(lastSeenID: number) {
      return axios.get<FolderEvent[]>(
        `${apiBase}/events?timeout=1&since=${lastSeenID}`,
      );
    },
    latestEvents() {
      return axios.get<FolderEvent[]>(`${apiBase}/events?limit=1`);
    },
  },
};

interface SyncServiceContextProviderProps {
  children: ReactNode;
}

export const SyncServiceContextProvider: FunctionComponent<
  SyncServiceContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { apiKey, homeDirWithForwardSlash, nas } = useSettingsService();
  const { t } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [online, setOnline] = useState(false);
  const [started, setStarted] = useState(false);

  /**
   * Define state attributes & memos for sync-service data
   */
  const [devices, setDevices] = useState<Device[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const nasDevice = useMemo(
    () => devices.find(({ deviceID }) => deviceID === nas),
    [devices, nas],
  );
  const [folderStatuses, setFolderStatuses] = useState<
    Record<string, FolderStatus>
  >({});

  /**
   * Remember latest event ID
   */
  const [lastEventId, setLastEventId] = useState(0);

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  /**
   * Automatically start sync service when home directory is set
   */
  useEffect(() => {
    if (homeDirWithForwardSlash) {
      start();
    }
  }, [homeDirWithForwardSlash]);

  /**
   * Configure HTTP client authentication when the API key is set
   */
  useEffect(() => {
    if (apiKey) {
      axios.defaults.headers.common["X-API-Key"] = apiKey;
    }
  }, [apiKey]);

  /**
   * Set the `started` state to `false` when receiving the `syncService.existed` message
   */
  useEffect(() => {
    window.ipcRenderer.on("syncService.exited", () => {
      setStarted(false);
      setOnline(false);
    });
    () => {
      window.ipcRenderer.removeAllListeners("syncService.exited");
    };
  }, []);

  /**
   * Setup service pinging in 5s intervals
   */
  useEffect(() => {
    if (apiKey) {
      const interval = setInterval(async () => {
        try {
          await SyncthingAPI.System.ping();

          // If service is reachable, set both `online` and `started` to true
          if (!online) {
            setOnline(true);
          }
          if (!started) {
            setStarted(true);
          }
        } catch (e) {
          if (online) {
            setOnline(false);
          }
          if (started) {
            setStarted(false);
          }
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [apiKey]);

  /**
   * Configure periodic polling of the sync service config
   */
  useEffect(() => {
    const getConfig = async () => {
      // Skip updating devices and folders state when the service is not online
      if (!online) {
        return;
      }

      // Refresh config
      const {
        data: { devices, folders },
      } = await SyncthingAPI.System.getConfig();
      setDevices(devices);
      setFolders(folders);

      // Get initial folder states for folder that or not yet part of `folderStatuses`
      // ! This is necessary for instances where folder states did not change since the app started (e.g. after startup)
      if (folders.length > 0 && Object.entries(folderStatuses).length === 0) {
        const missingFolderStatusResponses = await Promise.all(
          folders
            .filter(({ id }) => !Object.keys(folderStatuses).includes(id))
            .map(async ({ id }) => [
              id,
              (await SyncthingAPI.DB.folderStatus(id)).data,
            ]),
        );
        setFolderStatuses((folderStatuses) => ({
          ...folderStatuses,
          ...Object.fromEntries(missingFolderStatusResponses),
        }));
      }
    };

    getConfig(); // Execute the callback once immediately
    const configInterval = setInterval(getConfig, 5000);
    return () => clearInterval(configInterval);
  }, [online, folderStatuses]);

  /**
   * Configure NAS device in sync service config
   */
  useEffect(() => {
    (async () => {
      // Skip configuration of NAS device if the `nas` ID isn't set or the service isn't online
      if (!online || !nas) {
        return;
      }

      const { data: deviceTemplate } =
        await SyncthingAPI.Config.getDeviceTemplate();
      SyncthingAPI.Config.setDevice({
        ...deviceTemplate,
        deviceID: nas,
        introducer: true,
      });
    })();
  }, [online, nas]);

  /**
   * Auto-subscribe to library folder & hide pending folders from Syncthing UI
   */
  useEffect(() => {
    // Skip hook if `nasDevice` is not set or service is not online
    if (!nasDevice || !online) {
      return;
    }

    const subscribeToLibraryFolderAndHidePendingFolders = async () => {
      const { data: pendingFolders } =
        await SyncthingAPI.Cluster.getPendingFolders();

      const ignoreTimestamp = new Date().toISOString();
      const { libraryFolder, pendingFoldersToIgnore } = Object.entries(
        pendingFolders,
      ).reduce(
        (previousValue, [id, pendingFolderConfig]) => {
          const { libraryFolder, pendingFoldersToIgnore } = previousValue;
          Object.entries(pendingFolderConfig.offeredBy).forEach(
            ([deviceId, deviceOfferedFolder]) => {
              // Initialize pending folders for device
              if (!pendingFoldersToIgnore[deviceId]) {
                pendingFoldersToIgnore[deviceId] = [];
              }

              if (deviceId === nasDevice.deviceID && id === gamelibDirId) {
                Object.assign(libraryFolder, {
                  id,
                  ...deviceOfferedFolder,
                });
              } else {
                pendingFoldersToIgnore[deviceId].push({
                  id,
                  ...deviceOfferedFolder,
                  // Overwrite `time` attribute with own ignore timestamp
                  time: ignoreTimestamp,
                });
              }
            },
          );
          return previousValue;
        },
        {
          libraryFolder: {},
          pendingFoldersToIgnore: {},
        } as {
          libraryFolder: PendingFolders[string]["offeredBy"][string] & {
            id: string;
          };
          pendingFoldersToIgnore: Record<
            string,
            (PendingFolders[string]["offeredBy"][string] & {
              id: string;
            })[]
          >;
        },
      );

      if (libraryFolder.label) {
        await SyncthingAPI.Config.setFolder(
          await newSyncFolderObject(gamelibDirId, libraryFolder.label),
        );
      }
      Object.entries(pendingFoldersToIgnore).forEach(
        ([deviceId, foldersToIgnore]) => {
          const device = devices.find(({ deviceID }) => deviceID === deviceId);
          SyncthingAPI.Config.setDevice({
            ...device,
            ignoredFolders: foldersToIgnore,
          });
        },
      );
    };
    subscribeToLibraryFolderAndHidePendingFolders();
    const interval = setInterval(
      subscribeToLibraryFolderAndHidePendingFolders,
      5000,
    );
    return () => clearInterval(interval);
  }, [online, nasDevice]);

  useEffect(() => {
    const interval = setInterval(getEvents, 5000);
    return () => clearInterval(interval);
  }, [online, lastEventId, folderStatuses]);

  useSwallowFirstEffect(() => {
    if (started) {
      if (online) {
        toast(t("toast.service.connection.connected"), { type: "success" });
      } else {
        toast(t("toast.service.connection.disconnected"), { type: "error" });
      }
    }
  }, [online, started]);

  /* -------------------------------------------------------------------------- */
  /*                             Instance Functions                             */
  /* -------------------------------------------------------------------------- */
  /**
   * Create a new Syncthing folder configuration object.
   * @param {String} id The id of the folder.
   * @param {String} label The label of the folder.
   * @returns {Object} The Syncthing folder object.
   */
  const newSyncFolderObject = useCallback(
    async (id: string, label: string): Promise<Folder> => {
      const { data: folderTemplate } =
        await SyncthingAPI.Config.getFolderTemplate();
      return {
        ...folderTemplate,
        type: "receiveonly",
        path: `${homeDirWithForwardSlash}/${label}`,
        id: id,
        label: label,
        // Share with all devices
        devices: devices.map((device) => {
          return {
            deviceID: device.deviceID,
          };
        }),
      };
    },
    [homeDirWithForwardSlash, devices],
  );

  const getEvents = async () => {
    if (!online) {
      return;
    }

    const { data: events } =
      lastEventId > 0
        ? await SyncthingAPI.Events.since(lastEventId)
        : await SyncthingAPI.Events.latestEvents();

    if (events.length === 0) {
      return;
    }

    const newFolderStatuses = events
      .sort(({ id: id1 }, { id: id2 }) => id1 - id2)
      .reduce(
        (previousValue, event) => {
          const { data, type } = event;
          switch (type) {
            case SyncEvents.FOLDER_SUMMARY:
              previousValue[data.folder] = (
                data as unknown as FolderSummaryEvent["data"]
              ).summary;
              break;
            case SyncEvents.STATE_CHANGED:
              // Skip state change event if the folder is not tracked in our state
              if (!folderStatuses[data.folder]) {
                break;
              }
              // If there is a state update for a folder that has not yet received a summary event, copy its state
              if (!previousValue[data.folder]) {
                previousValue[data.folder] = {
                  ...folderStatuses[data.folder],
                };
              }
              previousValue[data.folder].state = (
                data as unknown as FolderStateChangedEvent["data"]
              ).to;
              break;
            case SyncEvents.FOLDER_REJECTED:
              delete previousValue[data.folder];
              break;
          }
          return previousValue;
        },
        {} as Record<string, FolderStatus>,
      );

    const progress = Math.min(
      ...Object.values(newFolderStatuses).map(calculateDownloadProgress),
    );
    window.ipcRenderer.send(
      "setProgress",
      progress > 0 && progress < 1 ? progress : -1,
    );

    setFolderStatuses((folderStatuses) => ({
      ...folderStatuses,
      ...newFolderStatuses,
    }));
    setLastEventId(Math.max(...events.map(({ id }) => id)));
  };

  const start = async () => {
    if (started || !homeDirWithForwardSlash) {
      return;
    }
    toast(t("toast.service.starting"), { type: "success" });
    try {
      const retVal = await window.ipcRenderer.invoke(
        "controlSyncService",
        SyncServiceOperations.START,
        homeDirWithForwardSlash,
      );
      setStarted(true);
      return retVal;
    } catch (e) {
      setStarted(false);
      toast(t("toast.service.error.start"), { type: "error" });
    }
  };

  const restart = async () => {
    try {
      await SyncthingAPI.System.restart();
      setOnline(false);
      toast(t("toast.service.success.restart"), { type: "success" });
    } catch (e) {
      toast(t("toast.service.error.restart"), { type: "error" });
    }
  };

  const stop = async () => {
    try {
      await SyncthingAPI.System.stop();
      setOnline(false);
      setStarted(false);
      toast(t("toast.service.success.stop"), { type: "success" });
    } catch (e) {
      toast(t("toast.service.error.stop"), { type: "error" });
    }
  };

  const revertFolder = async (folderId: string) => {
    await SyncthingAPI.DB.revertFolder(folderId);
    await getEvents();
  };

  const downloadGame = async (gameConfig: Game) => {
    await SyncthingAPI.Config.setFolder(
      await newSyncFolderObject(gameConfig.id, gameConfig.title),
    );
    await getEvents();
  };

  const unPauseGame = async (folder: Folder, pause: boolean) => {
    await SyncthingAPI.Config.setFolder({ ...folder, paused: pause });
    await getEvents();
  };

  const deleteGame = async (folder: Folder) => {
    await SyncthingAPI.Config.deleteFolder(folder);
    window.ipcRenderer.invoke("controlGame", GameOperations.DELETE, folder);
    await getEvents();
    setFolderStatuses((folderStatuses) => {
      const newFolderStatuses = { ...folderStatuses };
      delete newFolderStatuses[folder.id];
      return newFolderStatuses;
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {
    started,
    online,
    folders,
    folderStatuses,
    getDiscovery: SyncthingAPI.System.getDiscovery,
    revertFolder,
    downloadGame,
    unPauseGame,
    deleteGame,
    getConnections: SyncthingAPI.System.connections,
    start,
    restart,
    stop,
  };
  return (
    <SyncServiceContext.Provider value={state}>
      {children}
    </SyncServiceContext.Provider>
  );
};
