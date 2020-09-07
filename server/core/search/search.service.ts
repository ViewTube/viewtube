import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import ytsr, { Result, Filter } from 'ytsr';
import { SearchMapper } from './search.mapper';
import { ISearchResponse } from './interface/search-response.interface';
import { response } from 'express';

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
    return ytsr(searchQuery.q, searchQuery)
      .then(result => {
        return SearchMapper.ytsrToDto(result);
      })
      .catch(err => {
        console.log(err);
        throw new InternalServerErrorException(`Error searching for ${searchQuery.q}`);
      });
  }
}
