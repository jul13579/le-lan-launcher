import {
  mdiCloudCheck,
  mdiCloudOffOutline,
  mdiCloudSearch,
  mdiDownload,
  mdiUpload,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Container, styled, Typography } from "@mui/material";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsService } from "../hooks/useSettingsService";
import { useSyncService } from "../hooks/useSyncService";
import { latestBpsFromSamples } from "../utils/latestBpsFromSamples";
import { bgTransparentDarkWithBlur } from "./CustomThemeProvider";

const footerHeight = 66;
const popupHeight = 250;

const Footer = styled("div")(({ theme }) => ({
  position: "fixed",
  display: "grid",
  gridTemplateRows: `0px ${footerHeight}px`,
  width: "100vw",
  bottom: 0,
  left: 0,
  zIndex: 9999,
  transition: "grid-template-rows 0.1s linear",
  ...bgTransparentDarkWithBlur,
  "> div": {
    height: "100%",
    width: "100%",
    overflow: "hidden",
  },
  "> div: nth-of-type(2)": {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridGap: theme.spacing(2),
    userSelect: "none",
    "> div": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  ":hover": {
    gridTemplateRows: `${popupHeight}px ${footerHeight}px`,
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
    [connections, nas]
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
      <div>
        <div></div>
      </div>
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
          <Typography px={1}>
            {t("{{val, mbps}}", { val: latestInBps / 1024 ** 2 })}
          </Typography>
        </div>
        <div>
          <Icon path={mdiUpload} size={1} color="red" />
          <Typography px={1}>
            {t("{{val, mbps}}", { val: latestOutBps / 1024 ** 2 })}
          </Typography>
        </div>
      </Container>
    </Footer>
  );
};
