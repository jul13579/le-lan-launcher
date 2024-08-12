import { mdiOpenInNew, mdiPlay, mdiRestart, mdiStop } from "@mdi/js";
import { default as Icon } from "@mdi/react";
import { Box, IconButton, styled, Typography } from "@mui/material";
import { IpcRenderer } from "electron";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SyncServiceOperations from "../enums/SyncServiceOperations";
import { useSettingsService } from "../hooks/useSettingsService";
import { useSyncService } from "../hooks/useSyncService";

const ConsoleViewContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
  maxWidth: "100%",
  overflow: "hidden",
}));

export const ConsoleView: FunctionComponent = () => {
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
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleEl = useRef<HTMLDivElement>();

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

  useEffect(() => {
    // Don't register mutation observer if `autoScroll` is not enabled
    if (!autoScroll) {
      return;
    }
    // Make sure the console element is set
    if (!consoleEl.current) {
      return;
    }

    const { current: el } = consoleEl;

    const consoleScrollHandler = () => {
      if (el.scrollTop >= el.scrollHeight - el.getBoundingClientRect().height) {
        setAutoScroll(true);
        return;
      }
      setAutoScroll(false);
    };

    const observer = new MutationObserver(() => {
      el.removeEventListener("scrollend", consoleScrollHandler);
      el.lastElementChild.scrollIntoView(
        false, // align at bottom of element
      );
      el.addEventListener("scrollend", consoleScrollHandler);
    });
    observer.observe(el, { childList: true });
    return () => observer.disconnect();
  }, [autoScroll]);

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
      <Box
        ref={consoleEl}
        height={"100%"}
        whiteSpace={"pre"}
        overflow={"auto"}
        display={"flex"}
        flexDirection={"column"}
      >
        {serviceMessages.map((messageObj, index) => (
          <span
            key={index}
            style={{
              color: messageObj.type === "stderr" ? "red" : "inherit",
            }}
          >
            {messageObj.message}
          </span>
        ))}
      </Box>
    </ConsoleViewContainer>
  );
};
