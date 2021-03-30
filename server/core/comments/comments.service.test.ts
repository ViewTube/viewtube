import { Test } from '@nestjs/testing';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let commentsService: CommentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CommentsService]
    }).compile();

    commentsService = moduleRef.get<CommentsService>(CommentsService);
  });

  describe('session token', () => {
    it('should return a session token', () => {
      return commentsService.getSessionToken('7Zdr-Ehh430').then(result => {
        console.log(result);
        expect(result).toBeTruthy();
      });
    });
  });

  describe('comments api', () => {
    it('should return comments', () => {
      return commentsService.getComments('7Zdr-Ehh430').then(result => {
        console.log(result);
        expect(result).toBeTruthy();
      });
    });
  });
});
