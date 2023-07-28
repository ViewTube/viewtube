import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CoreModule } from 'server/core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { defineIt, getPayloadJson } from '../common/test.helper';
import ytsr from 'ytsr';
import { CommentsResponseDto } from 'server/core/comments/dto/comments-response.dto';
import ytpl from 'ytpl';

describe('Core', () => {
  let app: NestFastifyApplication;
  let mongod: MongoMemoryServer;

  jest.setTimeout(60000);

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const dbUri = mongod.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(dbUri, {}), CoreModule]
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

  // defineIt('GET video', async () => {
  //   const videoId = 'b7zBJNmdImo';
  //   const result = await app.inject({ method: 'GET', url: `/videos/${videoId}` });

  //   expect(result.statusCode).toEqual(200);

  //   const payloadJson = getPayloadJson(result.payload);
  //   expect(payloadJson.videoId).toEqual(videoId);
  // });

  defineIt('GET video with invalid id', async () => {
    const videoId = 'invalid-id';
    const result = await app.inject({ method: 'GET', url: `/videos/${videoId}` });

    expect(result.statusCode).toEqual(500);
  });

  defineIt('GET channel', async () => {
    const channelId = 'UCBJycsmduvYEL83R_U4JriQ';
    const result = await app.inject({ method: 'GET', url: `/channels/${channelId}` });

    expect(result.statusCode).toEqual(200);

    const payloadJson = getPayloadJson(result.payload);
    expect(payloadJson.authorId).toEqual(channelId);
  });

  defineIt('GET channel with invalid id', async () => {
    // ChannelId is random string that is 10 characters long
    const channelId = 'fvkHgvbUko';
    const result = await app.inject({ method: 'GET', url: `/channels/${channelId}` });

    expect(result.statusCode).toEqual(500);
  });

  defineIt('GET autocomplete result', async () => {
    const query = 'john';
    const result = await app.inject({ method: 'GET', url: '/autocomplete', query: { q: query } });

    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeDefined();

    const payloadJson = getPayloadJson(result.payload);
    expect(payloadJson.length).toBeGreaterThan(0);
  });

  // defineIt('GET search filters', async () => {
  //   const q = 'Marques';
  //   const result = await app.inject({ method: 'GET', url: '/search/filters', query: { q } });

  //   expect(result.statusCode).toEqual(200);

  //   const payloadJson = getPayloadJson(result.payload);
  //   expect(payloadJson.length).toBeGreaterThan(0);
  // });

  // defineIt('GET search result', async () => {
  //   const q = 'Marques';
  //   const result = await app.inject({ method: 'GET', url: `/search`, query: { q } });

  //   expect(result.statusCode).toEqual(200);

  //   const payloadJson = getPayloadJson<ytsr.Result>(result.payload);
  //   expect(payloadJson.items.length).toBeGreaterThan(0);
  // });

  defineIt('GET top comments', async () => {
    const videoId = 'RTbrXiIzUt4';
    const result = await app.inject({ method: 'GET', url: `/comments/${videoId}` });

    expect(result.statusCode).toEqual(200);
    const payloadJson = getPayloadJson<CommentsResponseDto>(result.payload);

    expect(payloadJson.comments.length).toBeGreaterThan(0);
  });

  defineIt('GET comment replies', async () => {
    const videoId = 'RTbrXiIzUt4';
    const result = await app.inject({ method: 'GET', url: `/comments/${videoId}` });

    expect(result.statusCode).toEqual(200);
    const payloadJson = getPayloadJson<CommentsResponseDto>(result.payload);

    expect(payloadJson.comments.length).toBeGreaterThan(0);

    const commentWithReplies = payloadJson.comments.find(el => el.replyCount > 0);

    const resultReplies = await app.inject({
      method: 'GET',
      url: `/comments/${videoId}/replies`,
      query: { replyToken: commentWithReplies.replyToken }
    });
    expect(resultReplies.statusCode).toEqual(200);

    const repliesPayloadJson = getPayloadJson<CommentsResponseDto>(resultReplies.payload);
    expect(repliesPayloadJson.comments.length).toBeGreaterThan(0);
  });

  defineIt('GET playlist', async () => {
    const playlistId = 'PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj';
    const result = await app.inject({
      method: 'GET',
      url: `/playlists/${playlistId}`,
      query: { pages: '1' }
    });

    expect(result.statusCode).toEqual(200);
    const payloadJson = getPayloadJson<ytpl.Result>(result.payload);

    expect(payloadJson.id).toEqual(playlistId);
    expect(payloadJson.items.length).toBeGreaterThan(0);
  });
});
