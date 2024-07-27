import { useContext } from "react";
import { SyncthingServiceContext } from "../components/contexts/SyncthingService/SyncthingServiceContext";

export const useSyncthingService = () => useContext(SyncthingServiceContext);
