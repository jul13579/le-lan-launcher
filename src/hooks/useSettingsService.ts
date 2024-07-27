import { useContext } from "react";
import { SettingsServiceContext } from "../components/contexts/SettingsService/SettingsServiceContext";

export const useSettingsService = () => useContext(SettingsServiceContext);
