export type Sorting<T> = {
  [P in keyof T]?: SortParam;
};

export type SortParam = 'ASC' | 'DESC';  