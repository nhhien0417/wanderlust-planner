export const isVideo = (fileName: string): boolean => {
  if (!fileName) return false;
  const videoExtensions = [".mp4", ".mov", ".webm", ".avi", ".mkv"];
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  return videoExtensions.includes(ext);
};
