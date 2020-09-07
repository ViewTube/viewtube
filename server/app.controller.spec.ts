import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  name,
  version,
  author,
  country
} from '../package.json';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService]
    }).compile();

    appService = moduleRef.get<AppService>(AppService);
    appController = moduleRef.get<AppController>(
      AppController
    );
  });

  describe('status', () => {
    it('should return some stats about the instance', async () => {
      const result = { name, version, country, author };
      jest
        .spyOn(appService, 'getStatus')
        .mockImplementation(() => result);

      expect(appController.getStatus()).toBe(result);
    });
  });
});
