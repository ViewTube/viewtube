import fs from 'fs';
import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { generateVAPIDKeys, VapidKeys } from 'web-push';
import { promisify } from 'util';
import path from 'path';

type ConfigurationType = {
  jwtKey?: string;
  publicVapidKey?: string;
  privateVapidKey?: string;
  rateLimitKey?: string;
};

@Injectable()
export class ConfigurationService {
  static jwtKey: string;
  static publicVapidKey: string;
  static privateVapidKey: string;
  static rateLimitKey: string;

  static async initializeEnvironment(): Promise<void> {
    if (this.jwtKey && this.publicVapidKey && this.privateVapidKey && this.rateLimitKey) {
      return;
    }
    const envJwtKey = process.env.VIEWTUBE_JWT_SECRET;
    const envPublicVapidKey = process.env.VIEWTUBE_PUBLIC_VAPID;
    const envPrivateVapidKey = process.env.VIEWTUBE_PRIVATE_VAPID;

    let savedConfiguration = await this.loadConfiguration();

    if (!savedConfiguration) {
      savedConfiguration = {};
    }

    const dbJwtKey = savedConfiguration.jwtKey;

    if (envJwtKey && dbJwtKey) {
      this.jwtKey = envJwtKey;
    } else if (envJwtKey && !dbJwtKey) {
      this.jwtKey = envJwtKey;
      savedConfiguration.jwtKey = envJwtKey;
    } else if (!envJwtKey && dbJwtKey) {
      this.jwtKey = savedConfiguration.jwtKey;
    } else if (!envJwtKey && !dbJwtKey) {
      const newJwtKey = crypto.randomBytes(256).toString('base64');
      this.jwtKey = newJwtKey;
      savedConfiguration.jwtKey = newJwtKey;
    }

    let newVapidKeys: VapidKeys = null;

    const savedPublicVapidKey = savedConfiguration.publicVapidKey;
    if (envPublicVapidKey && savedPublicVapidKey) {
      this.publicVapidKey = envPublicVapidKey;
    } else if (envPublicVapidKey && !savedPublicVapidKey) {
      this.publicVapidKey = envPublicVapidKey;
    } else if (!envPublicVapidKey && savedPublicVapidKey) {
      this.publicVapidKey = savedConfiguration.publicVapidKey;
    } else if (!envPublicVapidKey && !savedPublicVapidKey) {
      newVapidKeys = generateVAPIDKeys();
      this.publicVapidKey = newVapidKeys.publicKey;
      savedConfiguration.publicVapidKey = newVapidKeys.publicKey;
    }

    const dbPrivateVapidKey = savedConfiguration.privateVapidKey;
    if (envPrivateVapidKey && dbPrivateVapidKey) {
      this.privateVapidKey = envPrivateVapidKey;
    } else if (envPrivateVapidKey && !dbPrivateVapidKey) {
      this.privateVapidKey = envPrivateVapidKey;
    } else if (!envPrivateVapidKey && dbPrivateVapidKey) {
      this.privateVapidKey = savedConfiguration.privateVapidKey;
    } else if (!envPrivateVapidKey && !dbPrivateVapidKey) {
      if (!newVapidKeys) {
        newVapidKeys = generateVAPIDKeys();
      }
      this.privateVapidKey = newVapidKeys.privateKey;
      savedConfiguration.privateVapidKey = newVapidKeys.privateKey;
    }

    if (savedConfiguration.rateLimitKey) {
      this.rateLimitKey = savedConfiguration.rateLimitKey;
    } else {
      this.rateLimitKey = crypto.randomBytes(24).toString('base64');
      savedConfiguration.rateLimitKey = this.rateLimitKey;
    }

    process.env.VIEWTUBE_JWT_SECRET = this.jwtKey;
    process.env.VIEWTUBE_PUBLIC_VAPID = this.publicVapidKey;
    process.env.VIEWTUBE_PRIVATE_VAPID = this.privateVapidKey;
    process.env.NUXT_RATE_LIMIT_KEY = this.rateLimitKey;

    await this.saveConfiguration(savedConfiguration);
  }

  static async loadConfiguration(): Promise<ConfigurationType> {
    const readFile = promisify(fs.readFile);
    try {
      let configPath = './config.json';
      if (__basedir) {
        configPath = path.join(__basedir, '/config.json');
      }
      const file = await readFile(configPath);
      const obj = JSON.parse(file.toString());
      return obj;
    } catch {
      return null;
    }
  }

  static async saveConfiguration(data: ConfigurationType): Promise<void> {
    const writeFile = promisify(fs.writeFile);
    try {
      let configPath = './config.json';
      if (__basedir) {
        configPath = path.join(__basedir, '/config.json');
      }
      const saveData = JSON.stringify(data);
      await writeFile(configPath, saveData);
    } catch {
      return null;
    }
  }
}
