import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export const resolveNuxtPath = (): string => {
  const basePath = process.env.VIEWTUBE_BASE_DIR;
  let nuxtDir = path.resolve(__dirname, '../../client/.output');
  if (basePath) {
    nuxtDir = path.resolve(basePath, 'client/.output');
  }
  return nuxtDir;
};

export const resolveStaticFileList = async (nuxtPath: string): Promise<Array<string>> => {
  const staticDir = path.resolve(nuxtPath, 'public');
  const staticFileList = await walk(staticDir);
  const staticFileListRelative = staticFileList.map(file => file.replace(staticDir, ''));
  return staticFileListRelative;
};

const walk = async (dir: string) => {
  const entries = await readdir(dir);
  let ret: Array<string> = [];
  for (const entry of entries) {
    const fullpath = path.resolve(dir, entry);
    const info = await stat(fullpath);
    if (info.isDirectory()) {
      ret = [...ret, ...(await walk(fullpath))];
    } else {
      ret = [...ret, fullpath];
    }
  }
  return ret;
};
