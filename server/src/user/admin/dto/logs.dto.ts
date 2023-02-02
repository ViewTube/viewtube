import { LogFileDto } from './log-file.dto';

export class LogsDto {
  logFiles: Array<LogFileDto>;
  location: string;
}
