export default {
  lang: "Deutsch",
  nav: {
    settings: "Einstellungen",
    library: "Spielebibliothek",
  },
  toast: {
    theme: "Design gespeichert",
    backgroundHue: "Farbton gespeichert",
    playerName: "Spielername gespeichert",
    homeDir: "Spieleverzeichnis-Pfad gespeichert",
    nas: "NAS ID gespeichert",
    locale: "Sprache gespeichert",
    download: {
      started: "Download gestartet: {gameTitle}",
      paused: "Download pausiert: {gameTitle}",
      resumed: "Download fortgesetzt: {gameTitle}",
    },
    game: {
      delete: {
        success: "Spiel gelöscht: {gameTitle}",
        error: "Fehler beim Löschen: {error}",
      },
      reset: "Repariere Spiel: {gameTitle}",
    },
    service: {
      starting: "Service wird gestartet...",
      success: {
        start: "Service gestartet",
        stop: "Service wird beendet...",
        restart: "Service wird neu gestartet...",
      },
      error: {
        start: "Fehler beim Starten des Services",
        restart: "Fehler beim Neustarten des Services",
        stop: "Fehler beim Stoppen des Services",
      },
      connection: {
        connected: "Verbindung zu Service hergestellt",
        disconnected: "Verbindung zu Service verloren"
      }
    },
    debug: "Debug-Modus gespeichert",
  },
  statistics: {
    service_controls: "Service-Steuerung",
    cpu_load: "Prozessorauslastung",
    download_speed: "Downloadgeschwindigkeit",
    upload_speed: "Uploadgeschwindigkeit",
  },
  errors: {
    playerNameUnset: {
      title: "Spielername nicht gesetzt",
      message:
        "Bevor du auf die Spielebibliothek zugreifen kannst musst du deinen Spielernamen eingeben!",
    },
    homeDirUnset: {
      title: "Spieleverzeichnis nicht gesetzt",
      message:
        "Bevor du auf die Spielebibliothek zugreifen kannst musst du das Spieleverzeichnis setzen!",
    },
    nasUnset: {
      title: "NAS ID nicht gesetzt",
      message:
        "Bevor du auf die Spielebibliothek zugreifen kannst musst du die ID des NAS angeben!",
    },
  },
  settings: {
    theme: "Design",
    backgroundHue: "Farbton",
    environment: "Umgebung",
    debug: "Debug-Modus",
    debug_explanation:
      "Wenn du Probleme hast ein Spiel in den Launcher zu integrieren, kannst du diesen Modus aktivieren. Der Launcher wird dann beim Starten eines externen Programmes ein Fenster anzeigen, das die Standardausgabe des Prozesses protokolliert",
    language: "Sprache",
    playerName: "Spielername",
    homeDir: "Spieleverzeichnis",
    nas: "NAS ID",
    alerts: {
      discovery:
        "Bitte warte einen Moment, während verfügbare Geräte gesucht werden...",
      service:
        "Der Synchronisationsservice muss gestartet sein, damit verfügbare Netzwerkgeräte angezeigt werden können.",
    },
    images: "Bilder",
  },
  games: {
    lib_loading: "Spielebibliothek wird abgerufen...",
  },
  gameEntry: {
    download: "Herunterladen",
    play: "Spielen",
    reset: "Reparieren",
    pause: "Pause",
    resume: "Fortsetzen",
    browse: "Durchsuchen",
    delete: "Löschen",
  },
};
