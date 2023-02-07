import { WinstonModule, utilities } from 'nest-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logPath = process.env.VIEWTUBE_BASE_DIR ?? '.';

const winstonInstance = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike('ViewTube')
      )
    }),
    new winston.transports.DailyRotateFile({
      level: 'info',
      filename: `${logPath}/logs/%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '5m',
      maxFiles: '3d',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    })
  ]
});

export const logger = WinstonModule.createLogger({ instance: winstonInstance });
