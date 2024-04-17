import type { FastifyReply } from 'fastify';
import { JWT_EXPIRATION, SESSION_EXPIRATION } from './constants/session';

type SetAuthCookiesArgs = {
  reply: FastifyReply;
  accessToken: string;
  refreshToken?: string;
  secure: boolean;
};
export const setAuthCookies = ({
  reply,
  accessToken,
  refreshToken,
  secure
}: SetAuthCookiesArgs) => {
  reply.setCookie('AccessToken', accessToken, {
    httpOnly: true,
    path: '/',
    maxAge: JWT_EXPIRATION,
    secure: secure ?? undefined,
    sameSite: secure ? 'none' : 'lax'
  });

  if (refreshToken) {
    reply.setCookie('RefreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: SESSION_EXPIRATION,
      secure: secure ?? undefined,
      sameSite: secure ? 'none' : 'lax'
    });
  }
};
