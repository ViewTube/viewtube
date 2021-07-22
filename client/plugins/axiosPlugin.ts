import { wrapProperty } from '@nuxtjs/composition-api';

export const useAxios = wrapProperty('$axios', false);
