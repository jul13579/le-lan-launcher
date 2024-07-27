/**
 * Enum for sync-service events.
 * 
 * Sync this with https://github.com/syncthing/syncthing/blob/main/gui/default/syncthing/core/eventService.js
 */
enum SyncEvents {
  CONFIG_SAVED = "ConfigSaved", // Emitted after the config has been saved by the user or by Syncthing itself
  DEVICE_CONNECTED = "DeviceConnected", // Generated each time a connection to a device has been established
  DEVICE_DISCONNECTED = "DeviceDisconnected", // Generated each time a connection to a device has been terminated
  DEVICE_DISCOVERED = "DeviceDiscovered", // Emitted when a new device is discovered using local discovery
  DEVICE_REJECTED = "DeviceRejected", // DEPRECATED=Emitted when there is a connection from a device we are not configured to talk to
  PENDING_DEVICES_CHANGED = "PendingDevicesChanged", // Emitted when pending devices were added / updated (connection from unknown ID) or removed (device is ignored or added)
  DEVICE_PAUSED = "DevicePaused", // Emitted when a device has been paused
  DEVICE_RESUMED = "DeviceResumed", // Emitted when a device has been resumed
  CLUSTER_CONFIG_RECEIVED = "ClusterConfigReceived", // Emitted when receiving a remote device's cluster config
  DOWNLOAD_PROGRESS = "DownloadProgress", // Emitted during file downloads for each folder for each file
  FAILURE = "Failure", // Specific errors sent to the usage reporting server for diagnosis
  FOLDER_COMPLETION = "FolderCompletion", //Emitted when the local or remote contents for a folder changes
  FOLDER_REJECTED = "FolderRejected", // DEPRECATED=Emitted when a device sends index information for a folder we do not have, or have but do not share with the device in question
  PENDING_FOLDERS_CHANGED = "PendingFoldersChanged", // Emitted when pending folders were added / updated (offered by some device, but not shared to them) or removed (folder ignored or added or no longer offered from the remote device)
  FOLDER_SUMMARY = "FolderSummary", // Emitted when folder contents have changed locally
  ITEM_FINISHED = "ItemFinished", // Generated when Syncthing ends synchronizing a file to a newer version
  ITEM_STARTED = "ItemStarted", // Generated when Syncthing begins synchronizing a file to a newer version
  LISTEN_ADDRESSES_CHANGED = "ListenAddressesChanged", // Listen address resolution has changed.
  LOCAL_CHANGE_DETECTED = "LocalChangeDetected", // Generated upon scan whenever the local disk has discovered an updated file from the previous scan.
  LOCAL_INDEX_UPDATED = "LocalIndexUpdated", // Generated when the local index information has changed, due to synchronizing one or more items from the cluster or discovering local changes during a scan
  LOGIN_ATTEMPT = "LoginAttempt", // Emitted on every login attempt when authentication is enabled for the GUI.
  REMOTE_CHANGE_DETECTED = "RemoteChangeDetected", // Generated upon scan whenever a file is locally updated due to a remote change.
  REMOTE_DOWNLOAD_PROGRESS = "RemoteDownloadProgress", // DownloadProgress message received from a connected remote device.
  REMOTE_INDEX_UPDATED = "RemoteIndexUpdated", // Generated each time new index information is received from a device
  STARTING = "Starting", // Emitted exactly once, when Syncthing starts, before parsing configuration etc
  STARTUP_COMPLETED = "StartupCompleted", // Emitted exactly once, when initialization is complete and Syncthing is ready to start exchanging data with other devices
  STATE_CHANGED = "StateChanged", // Emitted when a folder changes state
  FOLDER_ERRORS = "FolderErrors", // Emitted when a folder has errors preventing a full sync
  FOLDER_WATCH_STATE_CHANGED = "FolderWatchStateChanged", // Watcher routine encountered a new error, or a previous error disappeared after retrying.
  FOLDER_SCAN_PROGRESS = "FolderScanProgress", // Emitted every ScanProgressIntervalS seconds, indicating how far into the scan it is at.
  FOLDER_PAUSED = "FolderPaused", // Emitted when a folder is paused
  FOLDER_RESUMED = "FolderResumed", // Emitted when a folder is resumed
}

export default SyncEvents;
