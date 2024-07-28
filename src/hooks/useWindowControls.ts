import WindowOperation from "../enums/WindowOperation";

export const useWindowControls = () => {
  function sendWindowControl(action: WindowOperation) {
    window.ipcRenderer.send("controlWindow", action);
  }

  function minimizeWindow() {
    sendWindowControl(WindowOperation.MINIMIZE);
  }

  function maximizeWindow() {
    sendWindowControl(WindowOperation.MAXIMIZE);
  }

  function closeWindow() {
    sendWindowControl(WindowOperation.CLOSE);
  }

  return { minimizeWindow, maximizeWindow, closeWindow };
};
