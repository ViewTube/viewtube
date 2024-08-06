export const fixUrl = (url: string) => {
  return url.startsWith('//') ? `https:${url}` : url;
};
