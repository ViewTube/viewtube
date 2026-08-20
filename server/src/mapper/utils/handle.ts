export const getHandleFromUrl = (url: string): string => {
  if (!url) return '';
  const handleMatch = url.match(/\/@(.*)?\/?/i);
  if (handleMatch?.[1]) {
    // Lockup views url encode the handle, e.g. "/@BaladasRom%C3%A2nticas"
    try {
      return `@${decodeURIComponent(handleMatch[1])}`;
    } catch {
      return `@${handleMatch[1]}`;
    }
  }
};
