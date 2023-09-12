import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { isHttps } from 'viewtube/shared/util';
import { Model } from 'mongoose';
import { User } from 'server/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FastifyReply } from 'fastify';
import { setAuthCookies } from './set-auth-cookies';
import { Session } from './schemas/session.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    @InjectModel(Session.name)
    private readonly SessionModel: Model<Session>,
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

  async logout(reply: FastifyReply) {
    const refreshToken = reply.cookies.RefreshToken;

    await this.SessionModel.findOneAndRemove({ refreshToken }).exec();

    const emptyCookie = {
      path: '/'
    };

    reply.clearCookie('AccessToken', emptyCookie);
    reply.clearCookie('RefreshToken', emptyCookie);
  }

  async login(reply: FastifyReply, username: string, deviceName: string) {
    const payload = { username };
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get('VIEWTUBE_JWT_SECRET')
    });
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('VIEWTUBE_JWT_SECRET')
    });

    const secure = this.configService.get('NODE_ENV') === 'production' && isHttps();

    const session = new this.SessionModel({
      username,
      deviceName,
      refreshToken
    });

    await session.save();

    setAuthCookies({
      reply,
      accessToken,
      refreshToken,
      secure
    });
  }
}
