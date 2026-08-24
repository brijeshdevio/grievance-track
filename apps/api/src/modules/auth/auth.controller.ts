import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { USER_SUCCESS_MSG } from './constants/auth.constant';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    const data = await this.authService.register(body);
    return { data, message: USER_SUCCESS_MSG.REGISTER };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.login(body, res);
    return { message: USER_SUCCESS_MSG.LOGIN };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async profile(@CurrentUser('id') userId: string) {
    const data = await this.authService.profile(userId);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId, req, res);
    return { message: USER_SUCCESS_MSG.LOGOUT };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.refreshToken(req, res);
    return { message: USER_SUCCESS_MSG.REFRESH_TOKEN };
  }
}
