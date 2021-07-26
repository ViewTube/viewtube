import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiRequest } from 'server/metrics/schemas/api-request.schema';
import { User } from 'server/user/schemas/user.schema';
import Consola from 'consola';
import {
  EndpointStatisticDto,
  RequestStatisticDto,
  StatisticsDto,
  UserRegistrationDto
} from './dto/statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(ApiRequest.name)
    private readonly ApiRequestModel: Model<ApiRequest>,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>
  ) {}

  async getStatistics(): Promise<StatisticsDto> {
    let statistics: StatisticsDto = null;
    try {
      const apiCalls = await this.ApiRequestModel.find().exec();
      const users = await this.UserModel.find().exec();

      let endpoints = [];
      let registrations = [];
      try {
        endpoints = await new Promise(resolve => {
          const ep = this.getEndpointStatistics(apiCalls);
          resolve(ep);
        });

        registrations = await new Promise(resolve => {
          const r = this.getRegistrations(users);
          resolve(r);
        });
      } catch (error) {
        Consola.error(error);
      }

      statistics = {
        registrations,
        endpoints,
        registrationCount: users.length
      };
    } catch (error) {
      console.log(error);
    }

    if (statistics) {
      return statistics;
    }
    throw new InternalServerErrorException();
  }

  private getRegistrations(users: Array<User>): Array<UserRegistrationDto> {
    const mappedUsers = users.map(user => {
      const timestamp = new Date((user as any).createdAt);
      return {
        timestamp: timestamp.valueOf()
      };
    });

    return this.groupRegistrationsByDay(mappedUsers);
  }

  private getEndpointStatistics(apiCalls: Array<ApiRequest>): Array<EndpointStatisticDto> {
    apiCalls.map(data => {
      const newRequestData = data;
      if (newRequestData.params && newRequestData.params.id) {
        newRequestData.url = newRequestData.url
          .replace(newRequestData.params.id as string, '')
          .replace(/\?.*/i, '');
      }
      return newRequestData;
    });

    const groupedApiCalls = this.groupBy(apiCalls, 'url');

    const endpointStatsArray: Array<EndpointStatisticDto> = [];

    for (const url in groupedApiCalls) {
      const apiCallsArray = groupedApiCalls[url];

      const groupedApiCallsArray = this.groupApiCallsByDay(apiCallsArray);

      endpointStatsArray.push({
        url,
        uniqueRequests: groupedApiCallsArray
      });
    }

    return endpointStatsArray;
  }

  private groupApiCallsByDay(array: Array<any>) {
    const apiCalls: Array<RequestStatisticDto> = [];
    array.forEach(element => {
      const d = new Date(element.timestamp);
      d.setHours(0, 0, 0, 0);
      const date = d.getTime();

      if (apiCalls.findIndex(e => e.date === date) === -1) {
        apiCalls.push({ date, averageResponseTime: 0, requestCount: 0 });
      }
      const dateIndex = apiCalls.findIndex(e => e.date === date);

      apiCalls[dateIndex].averageResponseTime += element.requestDuration;
      apiCalls[dateIndex].requestCount += 1;
    });

    return apiCalls;
  }

  private groupRegistrationsByDay(array: Array<any>) {
    const apiCalls: Array<UserRegistrationDto> = [];
    array.forEach(element => {
      const d = new Date(element.timestamp);
      d.setHours(0, 0, 0, 0);
      const date = d.getTime();

      if (apiCalls.findIndex(e => e.date === date) === -1) {
        apiCalls.push({ date, registrationCount: 0 });
      }
      const dateIndex = apiCalls.findIndex(e => e.date === date);
      apiCalls[dateIndex].registrationCount += 1;
    });

    return apiCalls;
  }

  private groupBy(array: Array<any>, property: string): { [key: string]: Array<any> } {
    return array.reduce((previous, current) => {
      previous[current[property]] = [...(previous[current[property]] || []), current];
      return previous;
    }, {});
  }
}
