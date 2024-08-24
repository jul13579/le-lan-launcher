import { createContext } from "react";

export const LibraryContext = createContext<{
  lib: Library;
  libFolderPathname: string;
}>(null);
