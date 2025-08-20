import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: process.env.PRODUCTION === 'true' ? '.moneyhub.store' : 'localhost',
  maxAge: 60 * 24 * 60 * 60 * 1000,
};
