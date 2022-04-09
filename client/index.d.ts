import { accessorType } from '@/store';

declare module 'vue/types/vue' {
  interface Vue {
    $accessor: typeof accessorType;
  }
}
