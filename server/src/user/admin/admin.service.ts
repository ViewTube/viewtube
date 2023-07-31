import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join, resolve } from 'path';
import { readdir, stat } from 'fs/promises';
import { LogsDto } from './dto/logs.dto';
import { createReadStream, existsSync } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { BlockedVideo } from './schemas/blocked-video';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(
    private configService: ConfigService,
    @InjectModel(BlockedVideo.name)
    private readonly blockedVideoModel: Model<BlockedVideo>
  ) {}

  async getLogs(): Promise<LogsDto> {
    let logFolder = resolve(__dirname, '../logs');
    if (this.configService.get('VIEWTUBE_BASE_DIR')) {
      logFolder = resolve(this.configService.get('VIEWTUBE_BASE_DIR'), 'logs');
    }

    const logFiles = await readdir(logFolder);

    const logPromises = logFiles
      .filter(file => !file.endsWith('.gz'))
      .map(async file => {
        const fileInfo = await stat(resolve(logFolder, file));
        return {
          name: file,
          size: fileInfo.size,
          created: fileInfo.birthtimeMs,
          lastModified: fileInfo.mtimeMs
        };
      });

    const resolvedLogs = await Promise.allSettled(logPromises);

    const logs = resolvedLogs
      .map(logResult => {
        if (logResult.status === 'fulfilled') {
          return logResult.value;
        }
        return null;
      })
      .filter(log => log !== null)
      .sort((a, b) => b.name.localeCompare(a.name));

    return {
      logFiles: logs,
      location: logFolder
    };
  }

  async dowloadLogFile(logFile: string): Promise<StreamableFile> {
    let logFolder = resolve(__dirname, '../logs');
    if (this.configService.get('VIEWTUBE_BASE_DIR')) {
      logFolder = resolve(this.configService.get('VIEWTUBE_BASE_DIR'), 'logs');
    }

    const sanitizedLogFile = logFile.replaceAll('..', '').replaceAll('/', '').replaceAll('\\', '');
    const logFilePath = join(logFolder, sanitizedLogFile);

    if (!existsSync(logFilePath)) {
      throw new NotFoundException('Log file not found');
    }

    const logFileStream = createReadStream(logFilePath);

    return new StreamableFile(logFileStream, {
      disposition: 'attachment'
    });
  }

  async getAllBlockedVideoIds(): Promise<string[]> {
    const blockedVideos = await this.blockedVideoModel.find().exec();
    return blockedVideos.map(video => video.videoId);
  }

  async isVideoBlocked(videoId: string): Promise<boolean> {
    const blockedVideo = await this.blockedVideoModel.findOne({ videoId }).exec();
    if (!blockedVideo) {
      return false;
    }
    return true;
  }

  async blockVideoId(videoId: string): Promise<string> {
    const videoIdToBlock = videoId.trim();
    if (!videoIdToBlock) {
      throw new BadRequestException();
    }
    const blockedVideo = await this.blockedVideoModel.findOneAndUpdate(
      { videoId },
      { videoId },
      { new: true, upsert: true }
    );
    return blockedVideo.videoId;
  }

  async unblockVideoId(videoId: string): Promise<void> {
    await this.blockedVideoModel.findOneAndRemove({ videoId });
  }
}
