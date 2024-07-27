import { useContext } from "react";
import { SyncServiceContext } from "../components/contexts/SyncService/SyncServiceContext";

export const useSyncService = () => useContext(SyncServiceContext);
