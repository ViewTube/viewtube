export async function nuxtImporter() {
  let nuxtDir = '../../../../client/.output/server/index.mjs';
  if (process.env.VIEWTUBE_BASE_DIR) {
    nuxtDir = `${process.env.VIEWTUBE_BASE_DIR}/client/.output/server/index.mjs`;
  }
  return Function(`return\x20import(\x22${nuxtDir}\x22)`)();
}
