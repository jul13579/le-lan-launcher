import { createContext } from "react";

export const LibraryContext = createContext<{
  lib: Library;
  libFolderPath: string;
}>(null);
