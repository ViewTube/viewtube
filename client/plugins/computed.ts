import { computed } from '#imports';

export const createComputed = (computedFn: Function) => {
  return computed({ get: () => computedFn(), set: () => {} });
};
