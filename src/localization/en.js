export default {
  lang: "English",
  nav: {
    settings: "Settings",
    library: "Game library",
  },
  toast: {
    theme: "Design saved",
    backgroundHue: "Color saved",
    playerName: "Playername saved",
    homeDir: "Installation directory saved",
    nas: "NAS ID saved",
    locale: "Language saved",
    service: {
      started: "Service is starting...",
      stopped: "Service is shutting down...",
      restarting: "Service is restarting...",
      error: {
        restarting: "Error restarting service",
        stopping: "Error stopping service",
      },
    },
    debug: "Debug mode saved",
  },
  statistics: {
    service_controls: "Service controls",
    cpu_load: "CPU load",
    download_speed: "Download speed",
    upload_speed: "Upload speed",
  },
  errors: {
    playerNameUnset: {
      title: "Playername is not set",
      message:
        "You have to set a playername before you can access the game library!",
    },
    homeDirUnset: {
      title: "Library path not set",
      message:
        "You have to set the library path before you can access the game library!",
    },
    nasUnset: {
      title: "NAS ID not set",
      message:
        "You have to set the NAS ID before you can access the game library!",
    },
  },
  settings: {
    theme: "Theme",
    backgroundHue: "Background color",
    environment: "Environment",
    debug: "Debug mode",
    debug_explanation:
      "If you have trouble integrating a game into this launcher, you can enable this mode. When starting an external executable, the launcher will display a window with the process' output log",
    language: "Language",
    playerName: "Playername",
    homeDir: "Library path",
    nas: "NAS ID",
    alerts: {
      discovery: "Please wait a moment while online devices are discovered...",
      service:
        "The syncing service has to be started in order to discover online devices.",
    },
    images: "Images",
  },
  games: {
    lib_loading: "Game library is being downloaded...",
  },
  gameEntry: {
    download: "Download",
    play: "Play",
    reset: "Reset",
    pause: "Pause",
    resume: "Resume",
    browse: "Browse",
    delete: "Delete",
  },
};
