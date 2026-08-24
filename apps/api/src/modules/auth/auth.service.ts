import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailsService } from '@/queues/emails/emails.service';
import {
  clearTokenCookies,
  comparePassword,
  generateRandomStr,
  hashPassword,
  hashRandomStr,
  setTokenCookies,
} from '@/common/helpers';
import { COOKIE_EXPIRATION, COOKIE_NAME } from '@/common/constants';
import { env } from '@/config';
import { Role } from '@/types/prisma.type';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  JWTTokenPayload,
  ProfileResponse,
  RegisterResponse,
} from './types/auth.type';
import { USER_ERROR_MSG } from './constants/auth.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailsService: EmailsService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException(USER_ERROR_MSG.CONFLICT_EMAIL);
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Send welcome email
    await this.emailsService.sendWelcomeEmail({
      email: dto.email,
      name: dto.name,
    });

    return user;
  }

  async login(dto: LoginDto, res: Response): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(USER_ERROR_MSG.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ForbiddenException(USER_ERROR_MSG.ACCOUNT_NOT_ACTIVE);
    }

    const isPasswordValid = await comparePassword(
      dto.password,
      user.passwordHash as string,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(USER_ERROR_MSG.INVALID_CREDENTIALS);
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );
    setTokenCookies(res, accessToken, refreshToken);
  }

  async profile(userId: string): Promise<ProfileResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(USER_ERROR_MSG.NOT_FOUND);
    }

    return user;
  }

  async logout(userId: string, req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[COOKIE_NAME.REFRESH_TOKEN] as string;
    if (!refreshToken) {
      throw new UnauthorizedException(USER_ERROR_MSG.INVALID_REFRESH_TOKEN);
    }

    const refreshTokenHash = hashRandomStr(refreshToken);

    const session = await this.prismaService.session.findFirst({
      where: {
        userId,
        tokenHash: refreshTokenHash,
        isRevoked: false,
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException(USER_ERROR_MSG.SESSION_EXPIRED);
    }

    await this.prismaService.session.update({
      where: { id: session.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    clearTokenCookies(res);
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[COOKIE_NAME.REFRESH_TOKEN] as string;
    if (!refreshToken) {
      throw new UnauthorizedException(USER_ERROR_MSG.INVALID_REFRESH_TOKEN);
    }

    const refreshTokenHash = hashRandomStr(refreshToken);

    const session = await this.prismaService.session.findUnique({
      where: { tokenHash: refreshTokenHash },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        isRevoked: true,
        user: {
          select: {
            id: true,
            role: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (
      !session ||
      session.isRevoked ||
      session.expiresAt <= new Date() ||
      !session.user.isActive
    ) {
      throw new UnauthorizedException(USER_ERROR_MSG.INVALID_REFRESH_TOKEN);
    }

    const newRefreshToken = generateRandomStr();
    const newRefreshTokenHash = hashRandomStr(newRefreshToken);

    const payload: JWTTokenPayload = {
      sub: session.userId,
      email: session.user.email,
      role: session.user.role,
      type: 'access',
    };

    const newAccessToken = await this.jwtService.signAsync(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    await this.prismaService.$transaction([
      this.prismaService.session.update({
        where: { id: session.id },
        data: {
          expiresAt: new Date(Date.now() + COOKIE_EXPIRATION.REFRESH_TOKEN),
          tokenHash: newRefreshTokenHash,
          lastActiveAt: new Date(),
        },
      }),
    ]);

    setTokenCookies(res, newAccessToken, newRefreshToken);
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JWTTokenPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = generateRandomStr();
    const refreshTokenHash = hashRandomStr(refreshToken);

    await this.prismaService.session.create({
      data: {
        expiresAt: new Date(Date.now() + COOKIE_EXPIRATION.REFRESH_TOKEN),
        tokenHash: refreshTokenHash,
        userId: userId,
      },
    });

    return { accessToken, refreshToken };
  }
}
