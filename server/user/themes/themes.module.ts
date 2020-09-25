import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { Theme, ThemeSchema } from './schemas/theme.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Theme.name,
        schema: ThemeSchema,
        collection: 'themes'
      }
    ])
  ],
  controllers: [ThemesController],
  providers: [ThemesService],
  exports: [ThemesService]
})
export class ThemesModule {}
