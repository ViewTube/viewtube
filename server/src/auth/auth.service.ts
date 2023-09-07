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

  logout(reply: FastifyReply) {
    const secure = this.configService.get('NODE_ENV') === 'production' && isHttps();

    reply.setCookie('Authentication', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      secure: secure ?? undefined,
      sameSite: secure ? 'strict' : undefined
    });
  }

  async login(reply: FastifyReply, username: string) {
    const payload = { username };
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d'
    });
    const accessToken = await this.jwtService.signAsync(payload);

    const secure = this.configService.get('NODE_ENV') === 'production' && isHttps();

    setAuthCookies({
      reply,
      accessToken,
      refreshToken,
      secure
    });
  }
}
