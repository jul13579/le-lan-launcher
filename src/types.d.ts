// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Vite
// plugin that tells the Electron app where to look for the Vite-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Overwrite `removeAllListeners` signature to allow optionally typed `channel` argument.
declare namespace Electron {
  interface IpcRenderer
    extends Omit<import("electron").IpcRenderer, "removeAllListeners"> {
    removeAllListeners(channel?: string): this;
  }
}

declare interface Window {
  ipcRenderer: Electron.IpcRenderer;
}

type GameFolder = {
  id: string;
  path: string;
};

interface Game {
  id: string;
  title: string;
  cover: string;
  launch: {
    exe: string;
  };
  moreLaunchs: {
    text: string;
    exe: string;
  };
  nameConfig: {
    env: string;
    file: string;
    regex: RegExp;
  };
}

interface Library {
  games: Game[];
}
