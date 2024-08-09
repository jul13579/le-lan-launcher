import { OpenDialogOptions, OpenDialogReturnValue } from "electron";

export const useFileChooser = () => ({
  openFileChooser: (
    cb: (arg1: OpenDialogReturnValue) => void,
    options: OpenDialogOptions,
  ) =>
    window.ipcRenderer.invoke("showOpenDialog", options).then((result) => {
      if (!result.canceled) cb(result);
    }),
});
