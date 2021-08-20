import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CoreModule } from 'server/core/core.module';
import { MongooseModule } from '@nestjs/mongoose';

describe('Core', () => {
  let app: NestFastifyApplication;
  let mongod: MongoMemoryServer;

  jest.setTimeout(60000);

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const dbUri = mongod.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(dbUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: false
        }),
        CoreModule
      ],
      providers: [
        // {
        //   provide: getModelToken('VideoBasicInfo'),
        //   useValue: mockUserModel
        // },
        // {
        //   provide: getModelToken('ChannelBasicInfo'),
        //   useValue: mockUserModel
        // }
      ]
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  it('/GET video success', () => {
    const videoId = 'RTbrXiIzUt4';
    return app.inject({ method: 'GET', url: `/videos/${videoId}` }).then(result => {
      expect(result.statusCode).toEqual(200);

      const payloadString = result.payload;
      const payloadJson = JSON.parse(payloadString);

      expect(payloadJson.videoId).toEqual(videoId);
    });
  });

  it('/GET video with invalid id', () => {
    const videoId = 'invalid-id';
    return app.inject({ method: 'GET', url: `/videos/${videoId}` }).then(result => {
      expect(result.statusCode).toEqual(500);
    });
  });
});
