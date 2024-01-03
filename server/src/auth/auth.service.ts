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
import { randomBytes } from 'crypto';
import { FastifyRequest } from 'fastify/types/request';
import { SerializeOptions } from '@fastify/cookie';

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

  async logout(reply: FastifyReply, request: FastifyRequest) {
    const refreshToken = request.cookies?.RefreshToken;

    await this.SessionModel.findOneAndDelete({ refreshToken }).exec();

    const secure = this.configService.get('NODE_ENV') === 'production' && isHttps();

    const deleteCookie: SerializeOptions = {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      secure: secure ?? undefined,
      sameSite: secure ? 'none' : 'lax'
    };

    reply.setCookie('AccessToken', '', deleteCookie);
    reply.setCookie('RefreshToken', '', deleteCookie);
    reply.code(204).send();
  }

  async login(reply: FastifyReply, username: string, deviceName: string, deviceType: string) {
    const payload = { username };
    const rawToken = randomBytes(64).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(rawToken, 3);
    const refreshToken = Buffer.from(hashedRefreshToken).toString('base64');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('VIEWTUBE_JWT_SECRET')
    });

    const secure = this.configService.get('NODE_ENV') === 'production' && isHttps();

    const session = new this.SessionModel({
      username,
      deviceName,
      deviceType,
      refreshToken,
      expiresAt: Date.now()
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
