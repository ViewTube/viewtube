import { Test, TestingModule } from '@nestjs/testing';
import { AutocompleteController } from './autocomplete.controller';

describe('Autocomplete Controller', () => {
  let controller: AutocompleteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutocompleteController],
    }).compile();

    controller = module.get<AutocompleteController>(AutocompleteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
