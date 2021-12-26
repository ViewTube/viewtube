export const importNuxtHandler = (clientDir = 'viewtube/client') => {
  return import(`${clientDir}/.output/server/index`);
};
