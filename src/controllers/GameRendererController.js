export default class GameController {
  static onDebugMsg(callback) {
    window.ipcRenderer.on("game", callback);
  }
}
