export const getProxyUrl = () => {
  return process.env.VIEWTUBE_PROXY_URL;
};

export const proxyEnabled = () => {
  return getProxyUrl() !== undefined;
};
