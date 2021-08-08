import { computed } from '@nuxtjs/composition-api';

export const createComputed = (computedFn: Function) => {
  return computed({ get: () => computedFn(), set: () => {} });
};
