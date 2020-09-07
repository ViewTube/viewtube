import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import ytsr from 'ytsr';

@Injectable()
export class SearchService {
  async doSearch(searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
    if (Object.keys(searchQuery).length <= 1) {
      return ytsr(searchQuery.q, {
        limit: 10
      })
        .then(result => {
          return result;
        })
        .catch(err => {
          throw new InternalServerErrorException(
            `Error searching for ${searchQuery.q}`
          );
        });
    } else {
      return ytsr
        .getFilters(searchQuery.q)
        .then(result => {
          return result as any;
        })
        .catch(err => {
          throw new InternalServerErrorException(
            `Error searching for ${searchQuery.q}`
          );
        });
    }
  }
}
