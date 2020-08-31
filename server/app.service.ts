import { Injectable } from '@nestjs/common';
import { name, version, author, country } from '../package.json';
import { StatusDto } from './status.dto';

@Injectable()
export class AppService {
  getStatus(): StatusDto {
    return {
      name,
      version,
      country,
      author,
    };
  }
}
