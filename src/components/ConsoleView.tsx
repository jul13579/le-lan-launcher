import { mdiOpenInNew, mdiPlay, mdiRestart, mdiStop } from "@mdi/js";
import Icon from "@mdi/react";
import { Box, IconButton, styled, Typography } from "@mui/material";
import { IpcRenderer } from "electron";
import { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SyncServiceOperations from "../enums/SyncServiceOperations";

const ConsoleViewContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const ConsoleViewHeader = styled("span")(() => ({
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
}));

export const ConsoleView: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
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
          <IconButton>
            <Icon path={mdiPlay} size={1} color="green" />
          </IconButton>
          <IconButton>
            <Icon path={mdiRestart} size={1} color="yellow" />
          </IconButton>
          <IconButton>
            <Icon path={mdiStop} size={1} color="red" />
          </IconButton>
        </div>
      </Box>
      <Box height={"100%"}>
        {serviceMessages.map((messageObj, index) => (
          <span
            key={index}
            style={{ color: messageObj.type === "stderr" ? "red" : "inherit" }}
          ></span>
        ))}
      </Box>
    </ConsoleViewContainer>
  );
};
