import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { isHttps } from 'viewtube/shared/util';
import { Model } from 'mongoose';
import { User } from 'server/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(username: string, pw: string) {
    const user = await this.UserModel.findOne({ username }).exec();

    if (user) {
      try {
        const comparison = await bcrypt.compare(pw, user.password);
        if (comparison === true) {
          const { username, profileImage } = user;
          return { username, profileImage };
        }
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  getDeletionCookie() {
    let secureString = '';
    if (this.configService.get('NODE_ENV') === 'production' && isHttps()) {
      secureString = 'Secure=true; SameSite=Strict; ';
    }
    const expiration = 0;
    return `Authentication=; HttpOnly=true; Path=/; ${secureString}Max-Age=${expiration}`;
  }

  async getJwtCookie(username: string) {
    const { accessToken } = await this.login(username);
    let secureString = '';
    if (this.configService.get('NODE_ENV') === 'production' && isHttps()) {
      secureString = 'Secure=true; SameSite=Strict; ';
    }
    const expiration = this.configService.get('VIEWTUBE_JWT_EXPIRATION_TIME');
    return `Authentication=${accessToken}; HttpOnly=true; Path=/; ${secureString}Max-Age=${expiration}`;
  }

  async login(username: string) {
    const payload = { username };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken
    };
  }
}
