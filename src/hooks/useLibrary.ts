import { useContext } from "react";
import { LibraryContext } from "../components/contexts/Library/LibraryContext";

export const useLibrary = () => useContext(LibraryContext);
