import { createRoot } from "react-dom/client";
import { SyncServiceContextProvider } from "./components/contexts/SyncService/SyncServiceContextProvider";
import { SettingsServiceContextProvider } from "./components/contexts/SettingsService/SettingsServiceContextProvider";
import { StrictMode } from "react";

function App() {
  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <SettingsServiceContextProvider>
      <SyncServiceContextProvider>
        <h1>Hello World</h1>
      </SyncServiceContextProvider>
    </SettingsServiceContextProvider>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
