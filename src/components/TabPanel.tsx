import { styled } from "@mui/material";
import { footerHeight } from "./ServiceStatistics";
import { appBarHeight } from "src/App";
import { FunctionComponent } from "react";

export interface TabPanelComponentProps {
  value: string;
}

interface TabPanelProps extends TabPanelComponentProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  match: string;
}

const TabPanelContent = styled("div", {
  shouldForwardProp: (prop) =>
    !(["fullHeight", "value", "match"] as PropertyKey[]).includes(prop),
})<TabPanelProps>(({ fullHeight, value, match }) => ({
  position: "relative",
  width: "100%",
  height: fullHeight ? "100%" : "auto",
  display: value === match ? "initial" : "none",
  animation: "opacity .2s linear, translateY .2s ease-out",
  "@keyframes opacity": {
    "0%": {
      opacity: 0,
    },
    "100%": {
      opacity: 1,
    },
  },
  "@keyframes translateY": {
    "0%": {
      transform: "translateY(25px)",
    },
    "100%": {
      transform: "initial",
    },
  },
}));

export const TabPanel: FunctionComponent<TabPanelProps> = ({
  children,
  value,
  match,
  fullHeight,
}) => {
  return (
    <TabPanelContent value={value} match={match} fullHeight={fullHeight}>
      {value === match ? children : null}
    </TabPanelContent>
  );
};

export const TabPanelContainer = styled("div")(() => ({
  paddingBottom: footerHeight,
  paddingTop: appBarHeight,
  minHeight: "100%",
  display: "grid", // This is only needed for the loading animation to be able to use 'height: 100%'
}));
