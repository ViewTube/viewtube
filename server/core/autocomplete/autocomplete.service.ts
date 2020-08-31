import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch'

@Injectable()
export class AutocompleteService {
  private url =
    'https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=';

  private responseRegex = new RegExp(/(window\.google\.ac\.h\()(.*)(\))/);

  async getAutocompleteResult(query: string): Promise<Array<string>> {
    const data: string = await fetch(this.url + query, {
      headers:{ charset: 'utf-8', 'Content-Type': 'text/plain' },
    })
      .then((response) => response.text())
      .then((e) => {
        return e;
      });
    const array: Array<any> = JSON.parse(data.match(this.responseRegex)[2]);
    return array[1].map((e: any) => e[0]);
  }
}
