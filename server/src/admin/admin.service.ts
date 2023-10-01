import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join, resolve } from 'path';
import { readdir, stat } from 'fs/promises';
import { LogsDto } from './dto/logs.dto';
import { createReadStream, existsSync } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { BlockedVideo } from './schemas/blocked-video';
import { Model } from 'mongoose';
import { InfoDto } from './dto/info.dto';
import { vtFetch } from 'server/common/vtFetch';
import { proxyEnabled } from 'server/common/proxyAgent';
import { UserprofileDto } from '../user/dto/userprofile.dto';
import { UserService } from '../user/user.service';
import { UserDto } from '../user/user.dto';

@Injectable()
export class AdminService {
  constructor(
    private configService: ConfigService,
    @InjectModel(BlockedVideo.name)
    private readonly blockedVideoModel: Model<BlockedVideo>,
    private userService: UserService
  ) {}

  async getInfo(): Promise<InfoDto> {
    const serverIpV4Response: any = await vtFetch('https://api.ipify.org?format=json').then(res =>
      res.body.json()
    );

    const serverIpV6Response: any = await vtFetch('https://api64.ipify.org?format=json').then(res =>
      res.body.json()
    );

    let proxyIpV4Response: any = { ip: null };
    let proxyIpV6Response: any = { ip: null };

    if (proxyEnabled()) {
      proxyIpV4Response = await vtFetch('https://api.ipify.org?format=json', {
        useProxy: true
      }).then(res => res.body.json());

      proxyIpV6Response = await vtFetch('https://api64.ipify.org?format=json', {
        useProxy: true
      }).then(res => res.body.json());
    }

    return {
      serverIpV4: serverIpV4Response.ip,
      serverIpV6: serverIpV6Response.ip,
      proxyIpV4: proxyIpV4Response.ip ?? 'No proxy configuration detected',
      proxyIpV6: proxyIpV6Response.ip ?? 'No proxy configuration detected'
    };
  }

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

  async createUser(user: UserDto): Promise<UserprofileDto> {
    const createdUser = await this.userService.create(user);
    return createdUser;
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
    await this.blockedVideoModel.findOneAndDelete({ videoId });
  }
}
