const gamelibDirId = "gamelib"; // The Syncthing folder ID of the library folder
const gamelibDirName = "Library"; // The Syncthing folder name of the library folder
const gamelibConfig = "library.json"; // The name of the library JSON file inside the library folder

export { gamelibDirId, gamelibDirName, gamelibConfig };

// Default syncthing folder configuration applied by client
export default {
  type: "receiveonly",
  rescanIntervalS: 3600,
  fsWatcherDelayS: 10,
  fsWatcherEnabled: true,
  minDiskFree: { value: 1, unit: "%" },
  maxConflicts: 10,
  fsync: true,
  order: "random",
  fileVersioningSelector: "none",
  trashcanClean: 0,
  simpleKeep: 5,
  staggeredMaxAge: 365,
  staggeredCleanInterval: 3600,
  staggeredVersionsPath: "",
  externalCommand: "",
  autoNormalize: true,
};
