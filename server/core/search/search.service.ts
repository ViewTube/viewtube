import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Consola from 'consola';
import ytsr, { ContinueResult, Result } from 'ytsr';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  async getFilters(searchString: string): Promise<Array<any>> {
    try {
      const filters = await ytsr.getFilters(searchString);
      return Array.from(filters);
    } catch (err) {
      throw new InternalServerErrorException(`Error getting filters for ${searchString}`);
    }
  }

  async continueSearch(searchContinuation: Array<any>): Promise<ContinueResult> {
    try {
      let continuationArray = searchContinuation;
      if (typeof searchContinuation[2] === 'string') {
        continuationArray = [
          searchContinuation[0],
          searchContinuation[1],
          JSON.parse(searchContinuation[2]),
          JSON.parse(searchContinuation[3])
        ];
        continuationArray[3].limit = Infinity;
      }
      const result = await ytsr.continueReq(continuationArray);
      return result;
    } catch (err) {
      Consola.error(err);
      throw new InternalServerErrorException(`Error continuing search`);
    }
  }

  async doSearch(searchQuery: SearchQueryDto): Promise<Result> {
    try {
      if (!searchQuery.pages) {
        searchQuery.pages = 1;
      }
      const result = await ytsr(searchQuery.q, searchQuery);
      return result;
    } catch (err) {
      Consola.error(err);
      throw new InternalServerErrorException(`Error searching for ${searchQuery.q}`);
    }
  }
}
