export async function importNuxt() {
  return Function('return import("../../../../client/.output/server/index.mjs")')();
}
