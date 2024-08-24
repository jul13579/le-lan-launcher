export const localPathToPathname = (localPath: string) =>
  new URL(`file://${localPath.replace(/\\/g, "/")}`).pathname;
