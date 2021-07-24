export class RequestStatisticDto {
  date: number;
  averageResponseTime: number;
  requestCount: number;
}

export class EndpointStatisticDto {
  url: string;
  uniqueRequests: Array<RequestStatisticDto>;
}

export class UserRegistrationDto {
  date: number;
  registrationCount: number;
}

export class StatisticsDto {
  registrationCount: number;

  registrations: Array<UserRegistrationDto>;

  endpoints: Array<EndpointStatisticDto>;
}
