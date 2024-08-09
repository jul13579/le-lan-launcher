import { styled } from "@mui/material";
import { FunctionComponent } from "react";
import { bgTransparentDarkWithBlur } from "./CustomThemeProvider";

const Footer = styled("div")(() => ({
  height: 66,
  position: "fixed",
  width: '100vw',
  bottom: 0,
  left: 0,
  zIndex: 9999,
  ...bgTransparentDarkWithBlur,
}));

export const ServiceStatistics: FunctionComponent = () => {
  return <Footer></Footer>;
};
