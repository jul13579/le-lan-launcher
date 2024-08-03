import { useContext } from "react";
import { LibraryContext } from "../components/contexts/LibraryContext/LibraryContext";

export const useLibrary = () => useContext(LibraryContext);
