import { Container, styled } from "@mui/material";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { bgTransparentDarkWithBlur } from "./CustomThemeProvider";
import { useSyncService } from "../hooks/useSyncService";
import { useSettingsService } from "../hooks/useSettingsService";
import Icon from "@mdi/react";
import {
  mdiCloudCheck,
  mdiCloudOffOutline,
  mdiCloudSearch,
  mdiDownload,
  mdiUpload,
} from "@mdi/js";
import { useTranslation } from "react-i18next";
import { latestBpsFromSamples } from "../utils/latestBpsFromSamples";

const Footer = styled("div")(({ theme }) => ({
  height: 66,
  position: "fixed",
  width: "100vw",
  bottom: 0,
  left: 0,
  zIndex: 9999,
  ...bgTransparentDarkWithBlur,
  "> div": {
    height: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridGap: theme.spacing(2),
    "> div": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
}));

const sampleCount = 30;

export const ServiceStatistics: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { nas } = useSettingsService();
  const { online, getStatus, getConnections } = useSyncService();
  const { t } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [status, setStatus] = useState(undefined);
  const [connections, setConnections] = useState<Connections>(undefined);
  const [serviceMessages, setServiceMessages] = useState([]);
  const [inBps, setInBps] = useState(new Array(sampleCount).fill([0, 0]));
  const [outBps, setOutBps] = useState(new Array(sampleCount).fill([0, 0]));

  const nasConnected = useMemo(
    () => connections?.connections?.[nas]?.connected || false,
    [connections, nas],
  );
  const latestInBps = useMemo(() => latestBpsFromSamples(inBps), [inBps]);
  const latestOutBps = useMemo(() => latestBpsFromSamples(outBps), [outBps]);

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  // Setup IPC handler for sync-service startup notifications
  useEffect(() => {
    window.ipcRenderer.on("syncService", async (event, messageObj) => {
      setServiceMessages((currentValue) => [...currentValue, messageObj]);
    });
  }, []);

  // Setup periodic task to fetch sync-service status
  useEffect(() => {
    if (!online) {
      return;
    }
    const getStatistics = async () => {
      const { data: status } = await getStatus();
      setStatus(status);
      const { data: connections } = await getConnections();
      setConnections(connections);

      const now = +new Date();
      setInBps((currentValue) => [
        ...currentValue.slice(-(sampleCount - 1)),
        [now, connections.total.inBytesTotal],
      ]);
      setOutBps((currentValue) => [
        ...currentValue.slice(-(sampleCount - 1)),
        [now, connections.total.outBytesTotal],
      ]);
    };
    const interval = setInterval(getStatistics, 5000);
    return () => clearInterval(interval);
  }, [online]);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Footer>
      <Container>
        <div>
          <Icon
            path={
              nasConnected
                ? mdiCloudCheck
                : !nasConnected && online
                  ? mdiCloudSearch
                  : mdiCloudOffOutline
            }
            size={1}
          />
        </div>
        <div>
          <Icon path={mdiDownload} size={1} color="green" />
        </div>
        <div>
          <Icon path={mdiUpload} size={1} color="red" />
        </div>
      </Container>
    </Footer>
  );
};
