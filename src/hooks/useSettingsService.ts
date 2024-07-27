import { useContext } from "react";
import { SettingsServiceContext } from "src/components/contexts/SettingsService/SettingsServiceContext";

export const useSettingsService = () => useContext(SettingsServiceContext);
