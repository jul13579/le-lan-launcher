import { createRoot } from "react-dom/client";
import { SyncthingServiceContextProvider } from "./components/contexts/SyncthingService/SyncthingServiceContextProvider";
import { SettingsServiceContextProvider } from "./components/contexts/SettingsService/SettingsServiceContextProvider";

function App() {
  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <SettingsServiceContextProvider>
      <SyncthingServiceContextProvider>
        <h1>Hello World</h1>
      </SyncthingServiceContextProvider>
    </SettingsServiceContextProvider>
  );
}

const root = createRoot(document.body);
root.render(<App />);
