import { ParamsDto } from "./params.dto";

export class ApiRequestDto {
  url: string;
  params: ParamsDto;
  requestDuration: number;
  timestamp: number;
}