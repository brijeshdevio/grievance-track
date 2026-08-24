import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { env } from '@/config';

import { JWTTokenPayload } from '../types/auth.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JWTTokenPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
