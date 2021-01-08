import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ytsr, { Result } from 'ytsr';
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

  async doSearch(searchQuery: SearchQueryDto): Promise<Result> {
    try {
      const result = await ytsr(searchQuery.q, searchQuery);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(`Error searching for ${searchQuery.q}`);
    }
  }
}
