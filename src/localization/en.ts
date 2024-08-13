export default {
  langs: {
    en: "English",
    de: "German",
  },
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
    download: {
      started: "Download started: {gameTitle}",
      paused: "Download paused: {gameTitle}",
      resumed: "Download resumed: {gameTitle}",
    },
    game: {
      delete: {
        success: "Game deleted: {gameTitle}",
        error: "Error deleting game: {error}",
      },
      reset: "Repairing game files: {gameTitle}",
    },
    service: {
      starting: "Service is starting...",
      success: {
        start: "Service started",
        stop: "Service is shutting down...",
        restart: "Service is restarting...",
      },
      error: {
        start: "Error starting service",
        restart: "Error restarting service",
        stop: "Error stopping service",
      },
      connection: {
        connected: "Connected to service",
        disconnected: "Disconnected from service",
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
      title: "Game library path not set",
      message:
        "You have to set the game library path before you can access the game library!",
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
    homeDir: "Game library path",
    nas: "NAS ID",
    alerts: {
      discovery: "Please wait a moment while online devices are discovered...",
      service:
        "The sync service has to be started in order to discover online devices.",
    },
    images: "Images",
  },
  games: {
    lib_loading: "Game library is being downloaded...",
    deleteDialog: {
      title: "Delete {gameTitle}?",
      message: "Do you really want to delete {gameTitle}?",
    },
  },
  gameEntry: {
    download: "Download",
    play: "Play",
    reset: "Repair",
    pause: "Pause",
    resume: "Resume",
    browse: "Browse",
    delete: "Delete",
  },
  cardActions: {
    cancel: "Cancel",
    delete: "Delete",
  },
} as const;
