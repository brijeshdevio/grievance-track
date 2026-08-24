import crypto from 'node:crypto';

import * as argon2 from 'argon2';

export const hashPassword = async (str: string): Promise<string> => {
  return await argon2.hash(str);
};

export const comparePassword = async (
  raw: string,
  hashedStr: string,
): Promise<boolean> => {
  return await argon2.verify(hashedStr, raw);
};

export const generateRandomStr = (): string => {
  return crypto.randomBytes(64).toString('base64url');
};

export const hashRandomStr = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
