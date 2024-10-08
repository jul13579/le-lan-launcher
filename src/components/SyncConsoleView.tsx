import { mdiOpenInNew, mdiPlay, mdiRestart, mdiStop } from "@mdi/js";
import { default as Icon } from "@mdi/react";
import { Box, IconButton, styled, Typography } from "@mui/material";
import { IpcRenderer } from "electron";
import { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SyncServiceOperations from "../enums/SyncServiceOperations";
import { useSettingsService } from "../hooks/useSettingsService";
import { useSyncService } from "../hooks/useSyncService";
import { Console } from "./Console";

const SyncConsoleViewContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
  maxWidth: "100%",
  overflow: "hidden",
}));

export const SyncConsoleView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { online, started, start, restart, stop } = useSyncService();
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
      window.ipcRenderer.removeAllListeners("syncService");
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
    <SyncConsoleViewContainer>
      <Box py={1} display={"flex"} justifyContent={"space-between"}>
        <Box display={"flex"} alignItems={"center"}>
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
        </Box>
        <div>
          <IconButton
            disabled={started || !homeDir}
            color="green"
            onClick={start}
          >
            <Icon path={mdiPlay} size={1} />
          </IconButton>
          <IconButton disabled={!online} color="yellow" onClick={restart}>
            <Icon path={mdiRestart} size={1} />
          </IconButton>
          <IconButton disabled={!online} color="red" onClick={stop}>
            <Icon path={mdiStop} size={1} />
          </IconButton>
        </div>
      </Box>
      <Console messages={serviceMessages} />
    </SyncConsoleViewContainer>
  );
};
