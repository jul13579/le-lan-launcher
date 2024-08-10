import { PaletteColor } from "@mui/material";

declare module "@mui/material/styles" {
  interface Palette {
    green: PaletteColor;
    yellow: PaletteColor;
    red: PaletteColor;
  }

  interface PaletteOptions {
    green?: PaletteColor;
    yellow?: PaletteColor;
    red?: PaletteColor;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    green: true;
    yellow: true;
    red: true;
  }
}
