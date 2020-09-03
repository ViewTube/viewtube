import { Injectable } from '@nestjs/common';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { Response } from 'express';
import { StreamInput } from '../stream-input';

@Injectable()
export class VideoplaybackService {
  private video: Readable;

  async getVideoStream(url: string, res: Response) {
    const audioOutput: string = path.resolve(`output/sound-${url}.mp4`);
    // const audioFolder: string = path.resolve(`output/sound-${url}`);
    const rangeStart = 0;
    // if (fs.existsSync(audioOutput)) {
    //   console.log('audio exists');
    //   const stats = fs.statSync(audioOutput);
    //   rangeStart = stats.size;
    // }
    const videoStream = ytdl(url, {
      filter: (format) => format.container === 'mp4' && !format.audioBitrate,
    }).on('error', console.error);

    const audioStream = ytdl(url, {
      quality: 'lowestaudio',
      range: { start: rangeStart },
      filter: (format) => format.container === 'mp4' && !format.qualityLabel,
    })
      .on('info', (videoInfo, videoFormat: ytdl.videoFormat) => {
        console.log(videoInfo, videoFormat);
        const audio = videoInfo.formats[23].url;
        const video = videoInfo.formats[4].url;
        ffmpeg()
          .input(video)
          .videoCodec('copy')
          .input(audio)
          .audioCodec('copy')
          .format('ismv')
          // .save(this.combinedOutput)
          // .concat(res, { end: true })
          .videoCodec('libx264')
          .on('progress', (videoProgress) => console.log(videoProgress))
          .on('end', () => {
            fs.unlink(audioOutput, (err) => {
              if (err) {
                console.log('unlink error:\n' + err);
              } else {
                console.log('done');
              }
            });
          })
          .on('error', (err: Error, stdout, stderr) => {
            console.log('ffmpeg error:\n' + err.message);
            console.log('ffmpeg stdout:\n' + stdout);
            console.log('ffmpeg stderr:\n' + stderr);
          })
          .pipe(res, { end: true });
      })
      .on('error', console.error)
      .on('progress', (chunkLength, downloaded, total) => {
        this.logProgress(chunkLength, downloaded, total, 'audio');
      })
      .on('finish', () => {
        console.log('done with audio');
      });
  }

  logProgress(chunkLength, downloaded, total, string) {
    // console.log(chunkLength, downloaded, total, string);
    console.log(
      `${string}:${chunkLength}`,
      `${((downloaded / total) * 100).toFixed(2)}%`,
    );
  }
}
