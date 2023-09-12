import { FastifyReply } from 'fastify';

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
    maxAge: 600,
    secure: secure ?? undefined,
    sameSite: secure ? 'none' : 'lax'
  });

  if (refreshToken) {
    reply.setCookie('RefreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: 604800,
      secure: secure ?? undefined,
      sameSite: secure ? 'none' : 'lax'
    });
  }
};
