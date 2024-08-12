import { createContext } from "react";

export const DebugModalContext = createContext<{
  openDebugDialog: () => void;
  clearMessages: () => void;
}>(null);
