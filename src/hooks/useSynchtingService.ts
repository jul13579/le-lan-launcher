import { useContext } from "react";
import { SyncthingServiceContext } from "src/components/contexts/SyncthingServiceContext/SyncthingServiceContext";

export const useSyncthingService = () => useContext(SyncthingServiceContext);
