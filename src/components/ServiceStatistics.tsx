import {
  mdiCloudCheck,
  mdiCloudOffOutline,
  mdiCloudSearch,
  mdiDownload,
  mdiUpload,
} from "@mdi/js";
import { default as Icon } from "@mdi/react";
import { Container, styled, Theme, Typography, useTheme } from "@mui/material";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsService } from "../hooks/useSettingsService";
import { useSyncService } from "../hooks/useSyncService";
import { latestBpsFromSamples } from "../utils/bpsFromSamples";
import { BarChart } from "./BarChart";
import { SyncConsoleView } from "./SyncConsoleView";
import { bgTransparentDarkWithBlur } from "./CustomThemeProvider";

export const footerHeight = 66;
const popupHeight = 250;

const Footer = styled("div")(() => ({
  position: "fixed",
  display: "grid",
  gridTemplateRows: `0px ${footerHeight}px`,
  width: "100vw",
  bottom: 0,
  left: 0,
  zIndex: 9999,
  transition: "grid-template-rows 0.1s linear",
  ...bgTransparentDarkWithBlur,
  ":hover": {
    gridTemplateRows: `${popupHeight}px ${footerHeight}px`,
  },
}));

const FooterItem = ({ theme }: { theme: Theme }) => ({
  height: "100%",
  width: "100%",
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridGap: theme.spacing(2),
  userSelect: "none",
});

const StatisticsOverview = styled(Container)(({ theme }) => ({
  ...FooterItem({ theme }),
  "> div": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const StatisticsInsights = styled(Container)(({ theme }) => ({
  ...FooterItem({ theme }),
  "> div": {
    height: popupHeight,
  },
}));

/**
 * Record one more sample to be able to calculate transmission speed between samples
 * and end up with 30 samples
 */
const sampleCount = 30 + 1;

export const ServiceStatistics: FunctionComponent = () => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { nas } = useSettingsService();
  const { online, getConnections } = useSyncService();
  const { t } = useTranslation();
  const theme = useTheme();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [connections, setConnections] = useState<Connections>(undefined);
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
  // Setup periodic task to fetch sync-service status
  useEffect(() => {
    if (!online) {
      return;
    }
    const getStatistics = async () => {
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
      <StatisticsInsights>
        <SyncConsoleView />
        <BarChart samples={inBps} headline={t("statistics.download_speed")} />
        <BarChart samples={outBps} headline={t("statistics.upload_speed")} />
      </StatisticsInsights>
      <StatisticsOverview>
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
          <Icon path={mdiDownload} size={1} color={theme.palette.green.main} />
          <Typography px={1}>
            {t("{{val, mbps}}", { val: latestInBps / 1024 ** 2 })}
          </Typography>
        </div>
        <div>
          <Icon path={mdiUpload} size={1} color={theme.palette.red.main} />
          <Typography px={1}>
            {t("{{val, mbps}}", { val: latestOutBps / 1024 ** 2 })}
          </Typography>
        </div>
      </StatisticsOverview>
    </Footer>
  );
};
