import { Continuation, Filter, Item, Refinement, Result } from 'ytsr';

export class VTSearchResult implements Result {
  originalQuery: string;
  correctedQuery: string;
  results: number;
  activeFilters: Filter[];
  refinements: Refinement[];
  items: Item[];
  continuation: Continuation;
}
