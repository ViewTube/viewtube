export type SortParam = 1 | -1;

export type Sorting<T> = {
  [P in keyof T]?: SortParam;
};
