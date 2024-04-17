import type { ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

const moduleMetadata: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Settings.name,
        schema: SettingsSchema,
        collection: 'user-settings'
      }
    ])
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService]
};
@Module(moduleMetadata)
export class SettingsModule {}
