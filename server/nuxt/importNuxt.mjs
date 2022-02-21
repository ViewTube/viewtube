export async function nuxtImporter() {
  return Function('return\x20import(\x22../../../../client/.output/server/index.mjs\x22)')();
}
