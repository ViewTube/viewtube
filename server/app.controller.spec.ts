import { AppController } from './app.controller';
import { AppService } from './app.service';
import { name, version, author, country } from '../package.json';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
    appController = new AppController(appService);
  });

  describe('status', () => {
    it('should return some stats about the instance', async () => {
      const result = { name, version, country, author };
      jest.spyOn(appService, 'getStatus').mockImplementation(() => result);

      expect(await appController.getStatus()).toBe(result);
    });
  });
});
