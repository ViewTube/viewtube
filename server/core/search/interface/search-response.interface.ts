import { Result } from 'ytsr';
import { SearchItem } from '../type/search-item.type';
export interface ISearchResponse extends Omit<Result, 'items'> {
  items: Array<SearchItem>;
}
