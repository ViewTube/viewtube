import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Theme, ThemeSchema } from './schemas/theme.schema';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
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
})
export class ThemeModule {}
