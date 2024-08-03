import axios from "axios";
import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { gamelibDirId } from "../../../config/folder";
import { baseUrl } from "../../../config/service";
import SyncServiceOperations from "../../../enums/SyncServiceOperations";
import { useForwardSlashSeparator } from "../../../hooks/useForwardSlashSeparator";
import { useSettingsService } from "../../../hooks/useSettingsService";
import { SyncServiceContext } from "./SyncServiceContext";

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
      return axios.get(`${apiBase}/system/config`);
    },
    connections() {
      return axios.get(`${apiBase}/system/connections`);
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
    getDevices() {
      return axios.get<Device[]>(`${apiBase}/config/devices`);
    },
    setDevice(device: Device) {
      return axios.post(`${apiBase}/config/devices`, device);
    },
    getFolders() {
      return axios.get<Folder[]>(`${apiBase}/config/folders`);
    },
    setFolder(folder: Folder) {
      return axios.post(`${apiBase}/config/folders`, folder);
    },
  },
  DB: {
    folderStatus(folderID: string) {
      return axios.get(`${apiBase}/db/status?folder=${folderID}`);
    },
    revertFolder(folder: string) {
      return axios.post(`${apiBase}/db/revert?folder=${folder}`);
    },
  },
  Cluster: {
    getPendingFolders() {
      return axios.get<PendingFolders>(`${apiBase}/cluster/pending/folders`);
    },
  },
  Events: {
    eventsSince(lastSeenID: string) {
      return axios.get(`${apiBase}/events?timeout=1&since=${lastSeenID}`);
    },
    latestEvents() {
      return axios.get(`${apiBase}/events?limit=1`);
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
  const { apiKey, homeDir, nas } = useForwardSlashSeparator(
    useSettingsService(),
    ["homeDir"]
  );

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
    [devices, nas]
  );

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  /**
   * Automatically start sync service when home directory is set
   */
  useEffect(() => {
    if (homeDir) {
      start();
    }
  }, [homeDir]);

  /**
   * Configure HTTP client authentication when the API key is set
   */
  useEffect(() => {
    if (apiKey) {
      axios.defaults.headers.common["X-API-Key"] = apiKey;
    }
  }, [apiKey]);

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
    };

    getConfig(); // Execute the callback once immediately
    const configInterval = setInterval(getConfig, 5000);
    () => clearInterval(configInterval);
  }, [online]);

  /**
   * Configure NAS device in sync service config
   */
  useEffect(() => {
    (async () => {
      // Skip configuration of NAS device if the `nas` ID isn't set, the service isn't online
      // or the device is already configured
      if (!online || nasDevice) {
        return;
      }

      const { data: deviceTemplate } =
        await SyncthingAPI.Config.getDeviceTemplate();
      SyncthingAPI.Config.setDevice({ ...deviceTemplate, deviceID: nas });
    })();
  }, [online, nasDevice]);

  /**
   * Auto-subscribe to library folder & hide pending folders from Syncthing UI
   */
  useEffect(() => {
    const subscribeToLibraryFolderAndHidePendingFolders = async () => {
      const { data: pendingFolders } =
        await SyncthingAPI.Cluster.getPendingFolders();

      const { libraryFolder, pendingFoldersToIgnore } = Object.entries(
        pendingFolders
      ).reduce(
        (previousValue, [id, pendingFolderConfig]) => {
          const nasOfferedFolder = pendingFolderConfig.offeredBy[nas];
          if (id === gamelibDirId) {
            previousValue.libraryFolder = { id, nasOfferedFolder };
          } else {
            previousValue.pendingFoldersToIgnore.push({ id, nasOfferedFolder });
          }
          return previousValue;
        },
        {
          libraryFolder: undefined,
          pendingFoldersToIgnore: [],
        } as {
          libraryFolder: {
            id: string;
            nasOfferedFolder: PendingFolders[string]["offeredBy"][string];
          };
          pendingFoldersToIgnore: {
            id: string;
            nasOfferedFolder: PendingFolders[string]["offeredBy"][string];
          }[];
        }
      );

      if (libraryFolder) {
        await SyncthingAPI.Config.setFolder(
          await newSyncFolderObject(
            gamelibDirId,
            libraryFolder.nasOfferedFolder.label
          )
        );
      }
      if (pendingFoldersToIgnore.length > 0 && nasDevice) {
        const ignoreTimestamp = new Date().toISOString();
        const { ignoredFolders } = nasDevice;
        const newIgnoredFolders = [
          ...ignoredFolders,
          ...pendingFoldersToIgnore.map(
            ({ id, nasOfferedFolder: { label } }) => ({
              id,
              label,
              time: ignoreTimestamp,
            })
          ),
        ];
        SyncthingAPI.Config.setDevice({
          ...nasDevice,
          ignoredFolders: newIgnoredFolders,
        });
      }
    };
    subscribeToLibraryFolderAndHidePendingFolders();
    const interval = setInterval(
      subscribeToLibraryFolderAndHidePendingFolders,
      5000
    );
    return () => clearInterval(interval);
  }, [nasDevice]);

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
        path: `${homeDir}/${label}`,
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
    [homeDir, devices]
  );

  function openSyncthingUI() {
    return window.ipcRenderer.invoke(
      "controlSyncService",
      SyncServiceOperations.OPEN_SYNCTHING_UI
    );
  }
  async function start() {
    if (started || !homeDir) {
      return;
    }
    try {
      const retVal = await window.ipcRenderer.invoke(
        "controlSyncService",
        SyncServiceOperations.START,
        homeDir
      );
      setStarted(true);
      return retVal;
    } catch (e) {
      console.error(
        `Encountered error when trying to start sync service: ${e}`
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {
    started,
    online,
    folders,
    getDiscovery: SyncthingAPI.System.getDiscovery,
  };
  return (
    <SyncServiceContext.Provider value={state}>
      {children}
    </SyncServiceContext.Provider>
  );
};
