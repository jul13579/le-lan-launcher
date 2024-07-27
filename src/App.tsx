import { createRoot } from "react-dom/client";
import { SyncthingServiceContextProvider } from "./components/contexts/SyncthingService/SyncthingServiceContextProvider";

function App() {
  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <SyncthingServiceContextProvider>
      <h1>Hello World</h1>
    </SyncthingServiceContextProvider>
  );
}

const root = createRoot(document.body);
root.render(<App />);
