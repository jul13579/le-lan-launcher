import { createRoot } from "react-dom/client";
import { SyncServiceContextProvider } from "./components/contexts/SyncService/SyncServiceContextProvider";
import { SettingsServiceContextProvider } from "./components/contexts/SettingsService/SettingsServiceContextProvider";
import { StrictMode } from "react";
import { CssBaseline } from "@mui/material";
import { CustomThemeProvider } from "./components/CustomThemeProvider";

function App() {
  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <SettingsServiceContextProvider>
      <SyncServiceContextProvider>
        <CustomThemeProvider>
          <h1>Hello World</h1>
        </CustomThemeProvider>
      </SyncServiceContextProvider>
    </SettingsServiceContextProvider>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(
  <StrictMode>
    <CssBaseline />
    <App />
  </StrictMode>
);
