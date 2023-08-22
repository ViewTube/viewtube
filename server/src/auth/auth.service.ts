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
    const user = await this.UserModel.findOne({ username });

    if (user) {
      try {
        const comparison = await bcrypt.compare(pw, user.password);
        if (comparison === true) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...result } = user;
          return result;
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

  getJwtCookie(username: string) {
    const { accessToken } = this.login(username);
    let secureString = '';
    if (this.configService.get('NODE_ENV') === 'production' && isHttps()) {
      secureString = 'Secure=true; SameSite=Strict; ';
    }
    const expiration = this.configService.get('VIEWTUBE_JWT_EXPIRATION_TIME');
    return `Authentication=${accessToken}; HttpOnly=true; Path=/; ${secureString}Max-Age=${expiration}`;
  }

  login(username: string) {
    return {
      accessToken: this.jwtService.sign({ username })
    };
  }
}
