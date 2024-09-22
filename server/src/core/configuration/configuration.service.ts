import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import fs from 'fs';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { logger } from 'server/common/logger';
import { VapidKeys, generateVAPIDKeys } from 'web-push';

type ConfigurationType = {
  jwtKey?: string;
  publicVapidKey?: string;
  privateVapidKey?: string;
};

@Injectable()
export class ConfigurationService {
  static jwtKey: string;
  static publicVapidKey: string;
  static privateVapidKey: string;

  static async initializeEnvironment(): Promise<void> {
    if (this.jwtKey && this.publicVapidKey && this.privateVapidKey) {
      return;
    }
    const envJwtKey = process.env.VIEWTUBE_JWT_SECRET;
    const envPublicVapidKey = process.env.VIEWTUBE_PUBLIC_VAPID;
    const envPrivateVapidKey = process.env.VIEWTUBE_PRIVATE_VAPID;

    let savedConfiguration = await this.loadConfiguration();

    if (!savedConfiguration) {
      savedConfiguration = {};
    }

    const savedJwtKey = savedConfiguration.jwtKey;

    if (envJwtKey) {
      this.jwtKey = envJwtKey;
      if (!savedJwtKey) {
        savedConfiguration.jwtKey = envJwtKey;
      }
    } else if (savedJwtKey) {
      this.jwtKey = savedJwtKey;
    } else {
      const newJwtKey = crypto.randomBytes(128).toString('base64');
      this.jwtKey = newJwtKey;
      savedConfiguration.jwtKey = newJwtKey;
    }

    let newVapidKeys: VapidKeys = null;

    const savedPublicVapidKey = savedConfiguration.publicVapidKey;

    if (envPublicVapidKey) {
      this.publicVapidKey = envPublicVapidKey;
    } else if (savedPublicVapidKey) {
      this.publicVapidKey = savedPublicVapidKey;
    } else {
      newVapidKeys = generateVAPIDKeys();
      this.publicVapidKey = newVapidKeys.publicKey;
      savedConfiguration.publicVapidKey = newVapidKeys.publicKey;
    }

    const savedPrivateVapidKey = savedConfiguration.privateVapidKey;

    if (envPrivateVapidKey) {
      this.privateVapidKey = envPrivateVapidKey;
    } else if (savedPrivateVapidKey) {
      this.privateVapidKey = savedPrivateVapidKey;
    } else {
      if (!newVapidKeys) {
        newVapidKeys = generateVAPIDKeys();
      }
      this.privateVapidKey = newVapidKeys.privateKey;
      savedConfiguration.privateVapidKey = newVapidKeys.privateKey;
    }

    process.env.VIEWTUBE_JWT_SECRET = this.jwtKey;
    process.env.VIEWTUBE_PUBLIC_VAPID = this.publicVapidKey;
    process.env.VIEWTUBE_PRIVATE_VAPID = this.privateVapidKey;

    await this.saveConfiguration(savedConfiguration);
  }

  static async loadConfiguration(): Promise<ConfigurationType> {
    const configPath = this.getConfigPath();
    if (fs.existsSync(configPath)) {
      return null;
    }

    try {
      const file = await readFile(configPath);
      const obj = JSON.parse(file.toString());
      logger.log(`Loaded configuration from ${configPath}`);
      return obj;
    } catch {
      return null;
    }
  }

  static async saveConfiguration(data: ConfigurationType): Promise<void> {
    try {
      const configPath = this.getConfigPath();

      const configFolder = configPath.replace('\\', '/').split('/').slice(0, -1).join('/');

      try {
        await access(configFolder, fs.constants.F_OK);
      } catch {
        await mkdir(configFolder, { recursive: true });
      }

      const saveData = JSON.stringify(data);
      await writeFile(configPath, saveData);
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  static getConfigPath(): string {
    let configPath = path.resolve('./config.json');
    if (process.env.VIEWTUBE_DATA_DIRECTORY) {
      configPath = path.resolve(process.env.VIEWTUBE_DATA_DIRECTORY, './config.json');
    }
    return configPath;
  }
}
