import { mdiClose } from "@mdi/js";
import { default as Icon } from "@mdi/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  styled,
} from "@mui/material";
import { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Console } from "src/components/Console";
import { DebugModalContext } from "./DebugModalContext";

const CloseButton = styled(IconButton)(() => ({
  position: "absolute",
  top: 8,
  right: 8,
}));

const ConsoleContainer = styled("div")(({ theme }) => ({
  height: 300,
  width: 600 - parseInt(theme.spacing(3)) * 2,
}));

interface DebugModalContextProviderProps {
  children: ReactNode;
}

export const DebugModalContextProvider: FunctionComponent<
  DebugModalContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { t } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SyncServiceMessageObj[]>([]);

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // Setup handler for game debug messages
    window.ipcRenderer.on("game", (event, debugMsgObj) => {
      setMessages((previousValue) => [...previousValue, debugMsgObj]);
    });
    return () => {
      window.ipcRenderer.removeAllListeners("game");
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {
    openDebugDialog: () => setIsOpen(true),
    clearMessages: () => setMessages([]),
  };
  return (
    <DebugModalContext.Provider value={state}>
      {children}
      <Dialog open={isOpen} maxWidth={"sm"}>
        <DialogTitle>{t("debugDialogTitle")}</DialogTitle>
        <CloseButton onClick={() => setIsOpen(false)}>
          <Icon path={mdiClose} size={1} />
        </CloseButton>
        <DialogContent>
          <ConsoleContainer>
            <Console messages={messages} />
          </ConsoleContainer>
        </DialogContent>
      </Dialog>
    </DebugModalContext.Provider>
  );
};
