import { useContext } from "react";
import { SyncthingServiceContext } from "src/components/contexts/SyncthingService/SyncthingServiceContext";

export const useSyncthingService = () => useContext(SyncthingServiceContext);
