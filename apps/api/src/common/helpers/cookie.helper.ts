import type { CookieOptions, Response } from 'express';

import { env } from '@/config';

import { COOKIE_EXPIRATION, COOKIE_NAME } from '../constants/cookie.constant';

const isProd = env.NODE_ENV == 'production';

const baseConfig: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

export function setTokenCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
) {
  response.cookie(COOKIE_NAME.ACCESS_TOKEN, accessToken, {
    ...baseConfig,
    maxAge: COOKIE_EXPIRATION.ACCESS_TOKEN,
  });

  response.cookie(COOKIE_NAME.REFRESH_TOKEN, refreshToken, {
    ...baseConfig,
    maxAge: COOKIE_EXPIRATION.REFRESH_TOKEN,
  });
}

export function clearTokenCookies(response: Response) {
  response.clearCookie(COOKIE_NAME.ACCESS_TOKEN, {
    ...baseConfig,
  });

  response.clearCookie(COOKIE_NAME.REFRESH_TOKEN, {
    ...baseConfig,
  });
}
