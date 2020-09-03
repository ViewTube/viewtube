import { Test, TestingModule } from '@nestjs/testing';
import { VideoplaybackController } from './videoplayback.controller';

describe('Videoplayback Controller', () => {
  let controller: VideoplaybackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoplaybackController],
    }).compile();

    controller = module.get<VideoplaybackController>(VideoplaybackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
