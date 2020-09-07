import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(username: string, pw: string) {
    const user = await this.userService.findOne(username);
    if (user) {
      try {
        const comparison = await bcrypt.compare(
          pw,
          user.password
        );
        if (comparison === true) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...result } = user;
          return result;
        }
      } catch (err) {
        console.error(err);
      }
    }
    return null;
  }

  getDeletionCookie() {
    let domainString = '';
    if (
      this.configService.get('NODE_ENV') === 'production'
    ) {
      domainString = `Domain=${this.configService.get(
        'VIEWTUBE_CURRENT_DOMAIN'
      )}; `;
    }
    const expiration = 0;
    return `Authentication=; HttpOnly=true; Secure=true; Path=/; ${domainString}Max-Age=${expiration}`;
  }

  async getJwtCookie(username: string) {
    const { accessToken } = await this.login(username);
    let domainString = '';
    if (
      this.configService.get('NODE_ENV') === 'production'
    ) {
      domainString = `Domain=${this.configService.get(
        'VIEWTUBE_CURRENT_DOMAIN'
      )}; `;
    }
    const expiration = this.configService.get(
      'VIEWTUBE_JWT_EXPIRATION_TIME'
    );
    return `Authentication=${accessToken}; HttpOnly=true; Secure=true; Path=/; ${domainString}Max-Age=${expiration}`;
  }

  async login(username: string) {
    return {
      accessToken: this.jwtService.sign({ username })
    };
  }
}
