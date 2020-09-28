import { Injectable, InternalServerErrorException } from '@nestjs/common';
import ytsr from 'ytsr';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchMapper } from './search.mapper';
import { ISearchResponse } from './interface/search-response.interface';

@Injectable()
export class SearchService {
  async getFilters(searchString: string): Promise<Array<any>> {
    try {
      const filters = await ytsr.getFilters(searchString);
      return Array.from(filters);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(`Error getting filters for ${searchString}`);
    }
  }

  async doSearch(searchQuery: SearchQueryDto): Promise<ISearchResponse> {
    try {
      const result = await ytsr(searchQuery.q, searchQuery);
      return SearchMapper.ytsrToDto(result);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(`Error searching for ${searchQuery.q}`);
    }
  }
}
