import WindowOperations from "../enums/WindowOperations";

export const useWindowControls = () => {
  function sendWindowControl(action: WindowOperations) {
    window.ipcRenderer.send("controlWindow", action);
  }

  function minimizeWindow() {
    sendWindowControl(WindowOperations.MINIMIZE);
  }

  function maximizeWindow() {
    sendWindowControl(WindowOperations.MAXIMIZE);
  }

  function closeWindow() {
    sendWindowControl(WindowOperations.CLOSE);
  }

  return { minimizeWindow, maximizeWindow, closeWindow };
};
