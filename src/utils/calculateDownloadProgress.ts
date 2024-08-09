export const calculateDownloadProgress = (folderStatus: FolderStatus) =>
  folderStatus?.globalBytes > 0
    ? folderStatus?.inSyncBytes / folderStatus?.globalBytes
    : 0;
