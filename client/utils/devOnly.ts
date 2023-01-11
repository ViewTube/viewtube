export const devOnly = <T>(value: T): T | undefined => {
  if (process.env.NUXT_BUILD === 'true') {
    if (Array.isArray(value)) {
      return [] as unknown as T;
    }
    return undefined;
  }
  return value;
};
