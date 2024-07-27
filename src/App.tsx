import { createRoot } from "react-dom/client";

function App() {
  return <h1>Hello World</h1>;
}

const root = createRoot(document.body);
root.render(<App />);
