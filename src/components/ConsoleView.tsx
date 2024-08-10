import { mdiOpenInNew, mdiPlay, mdiRestart, mdiStop } from "@mdi/js";
import Icon from "@mdi/react";
import { Box, IconButton, styled, Typography } from "@mui/material";
import { IpcRenderer } from "electron";
import { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SyncServiceOperations from "../enums/SyncServiceOperations";
import { useSyncService } from "../hooks/useSyncService";
import { useSettingsService } from "../hooks/useSettingsService";
import { green } from "@mui/material/colors";

const ConsoleViewContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
}));

export const ConsoleView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { online } = useSyncService();
  const { homeDir } = useSettingsService();
  const { t } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [serviceMessages, setServiceMessages] = useState<
    SyncServiceMessageObj[]
  >([]);

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  // Setup IPC handler for sync-service startup notifications
  useEffect(() => {
    const handler: Parameters<IpcRenderer["on"]>[1] = (
      event,
      messageObj: SyncServiceMessageObj,
    ) => {
      setServiceMessages((currentValue) => [...currentValue, messageObj]);
    };
    window.ipcRenderer.on("syncService", handler);
    return () => {
      window.ipcRenderer.off("syncService", handler);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                             Instance Functions                             */
  /* -------------------------------------------------------------------------- */
  const openSyncthingUI = () =>
    window.ipcRenderer.invoke(
      "controlSyncService",
      SyncServiceOperations.OPEN_SYNCTHING_UI,
    );

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <ConsoleViewContainer>
      <Box py={1} display={"flex"} justifyContent={"space-between"}>
        <div>
          <Typography
            whiteSpace={"nowrap"}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
            component={"span"}
            variant="h6"
            mr={1}
          >
            {t("statistics.service_controls")}
          </Typography>
          <IconButton onClick={openSyncthingUI}>
            <Icon path={mdiOpenInNew} size={1} />
          </IconButton>
        </div>
        <div>
          <IconButton disabled={online || !homeDir} color="green">
            <Icon path={mdiPlay} size={1} />
          </IconButton>
          <IconButton disabled={!online} color="yellow">
            <Icon path={mdiRestart} size={1} />
          </IconButton>
          <IconButton disabled={!online} color="red">
            <Icon path={mdiStop} size={1} />
          </IconButton>
        </div>
      </Box>
      <Box height={"100%"} whiteSpace={"pre"} overflow={"auto"}>
        {serviceMessages.map((messageObj, index) => (
          <span
            key={index}
            style={{ color: messageObj.type === "stderr" ? "red" : "inherit" }}
          >
            {messageObj.message}
          </span>
        ))}
      </Box>
    </ConsoleViewContainer>
  );
};
