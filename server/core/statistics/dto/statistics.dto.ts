class UniqueRequest {
  responseTime: number;
  timestamp: number;
}

export class EndpointStatisticDto {
  url: string;
  uniqueRequests: Array<UniqueRequest>;
}

export class UserRegistrationDto {
  timestamp: number;
}

export class StatisticsDto {
  registrations: Array<UserRegistrationDto>;

  endpoints: Array<EndpointStatisticDto>;
}
