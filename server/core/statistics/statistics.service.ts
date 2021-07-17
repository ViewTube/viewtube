import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiRequest } from 'server/metrics/schemas/api-request.schema';
import { User } from 'server/user/schemas/user.schema';
import { EndpointStatisticDto, StatisticsDto, UserRegistrationDto } from './dto/statistics.dto';

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
      const endpoints = await this.getEndpointStatistics();

      const registrations = await this.getRegistrations();

      statistics = {
        registrations,
        endpoints
      };
    } catch (error) {
      console.log(error);
    }

    if (statistics) {
      return statistics;
    }
    throw new InternalServerErrorException();
  }

  private async getRegistrations(): Promise<Array<UserRegistrationDto>> {
    const users = await this.UserModel.find().lean().exec();
    return users.map(user => {
      const timestamp = new Date((user as any).createdAt);
      return {
        timestamp: timestamp.valueOf()
      };
    });
  }

  private async getEndpointStatistics(): Promise<Array<EndpointStatisticDto>> {
    const apiCalls = await this.ApiRequestModel.find().lean().exec();

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

    const endpointStatsArray = [];

    for (const url in groupedApiCalls) {
      if (Object.prototype.hasOwnProperty.call(groupedApiCalls, url)) {
        const apiCallsArray = groupedApiCalls[url];

        endpointStatsArray.push({
          url,
          uniqueRequests: apiCallsArray.map(element => {
            return {
              responseTime: element.requestDuration,
              timestamp: element.timestamp
            };
          })
        });
      }
    }

    return endpointStatsArray;
  }

  private groupBy(arr: Array<any>, property: string) {
    return arr.reduce((acc, cur) => {
      acc[cur[property]] = [...(acc[cur[property]] || []), cur];
      return acc;
    }, {});
  }
}
