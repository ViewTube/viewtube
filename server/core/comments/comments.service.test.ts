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

  describe('comments api', () => {
    it('should return comments', () => {
      return commentsService.getComments('IZy2pZsfKlg', false, null).then(result => {
        const replyToken = result.comments.find(e => e.replyToken).replyToken;
        return commentsService.getCommentReplies('IZy2pZsfKlg', replyToken).then(result2 => {
          console.log(result2);
          expect(result).toBeTruthy();
        });
      });
    });
  });
});
