export const getChannelIdFromParam = (
  channelParam: string | string[] | undefined
): string | null => {
  return channelParam?.toString()?.split('/')?.[0] ?? null;
};

export const getCurrentPageFromParam = (channelParam: string | string[] | undefined): string => {
  return channelParam?.toString()?.split('/')?.[1] ?? 'home';
};
