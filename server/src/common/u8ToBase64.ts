export const u8ToBase64 = (u8: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(u8)));
};