export const getHandleFromUrl = (url: string): string => {
  const handleMatch = url.match(/\/@(.*)?\/?/i);
  if (handleMatch?.[1]) {
    return `@${handleMatch[1]}`;
  }
};
