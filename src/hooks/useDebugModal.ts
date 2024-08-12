import { useContext } from "react";
import { DebugModalContext } from "src/components/contexts/DebugModal/DebugModalContext";

export const useDebugModal = () => useContext(DebugModalContext);
