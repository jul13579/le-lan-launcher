export const useForwardSlashSeparator = <T extends object>(
  data: T,
  keys: (keyof T)[]
) => {
  const copyObj = { ...data };
  keys.forEach((key) => {
    if (copyObj[key] instanceof String) {
      copyObj[key].replace(/\\/g, "/");
    }
  });
  return copyObj;
};
