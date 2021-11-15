import { Injectable, InternalServerErrorException } from '@nestjs/common';
import undici from 'undici';

@Injectable()
export class AutocompleteService {
  private url = 'https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=';

  // eslint-disable-next-line prefer-regex-literals
  private responseRegex = new RegExp(/(window\.google\.ac\.h\()(.*)(\))/);

  async getAutocompleteResult(query: string): Promise<Array<string>> {
    try {
      const response = await undici.request(this.url + query);
      response.body.setEncoding('latin1');
      const data = await response.body.text();
      const array: Array<Array<unknown>> = JSON.parse(data.match(this.responseRegex)[2]);
      return array[1].map((e: unknown) => e[0]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
