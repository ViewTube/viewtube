import path from 'path';

export const resolveNuxtPath = (): string => {
  const basePath = process.env.VIEWTUBE_BASE_DIR;
  let nuxtDir = path.resolve(__dirname, '../../client/.output');
  if (basePath) {
    nuxtDir = path.resolve(basePath, 'client/.output');
  }
  return nuxtDir;
};
