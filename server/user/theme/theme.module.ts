import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Theme, ThemeSchema } from './schemas/theme.schema';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

const moduleMetadata: ModuleMetadata = {
  providers: [ThemeService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Theme.name,
        schema: ThemeSchema,
        collection: 'themes'
      }
    ])
  ],
  controllers: [ThemeController],
  exports: [ThemeService]
};
@Module(moduleMetadata)
export class ThemeModule {}
