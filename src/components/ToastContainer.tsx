import { useTheme } from "@mui/material";
import { ToastContainer as _ToastContainer, Zoom } from "react-toastify";

export const ToastContainer = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { palette } = useTheme();

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <_ToastContainer
      position="bottom-center"
      autoClose={5000}
      closeButton={true}
      transition={Zoom}
      theme={palette.mode}
    />
  );
};
