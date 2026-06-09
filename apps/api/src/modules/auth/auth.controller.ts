import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  googleCompleteProfileSchema,
  googleMobileAuthSchema,
  loginSchema,
  refreshSessionSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@amg/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { REFRESH_TOKEN_COOKIE } from '../../common/constants/auth.constants';
import { parseWithSchema } from '../../common/utils/zod.utils';
import { authThrottle, forgotPasswordThrottle } from '../../common/guards/throttler.config';
import { ApiCacheInterceptor, CacheConfig } from '../../common/interceptors/cache.interceptor';
import type { JwtPayload } from '@amg/shared';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle(authThrottle)
  async register(@Body() body: unknown) {
    return this.authService.register(parseWithSchema(registerSchema, body));
  }

  @Post('login')
  @HttpCode(200)
  @Throttle(authThrottle)
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(parseWithSchema(loginSchema, body), response);
  }

  @Post('google/mobile')
  @HttpCode(200)
  @Throttle(authThrottle)
  async googleMobile(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    return this.authService.loginWithGoogle(
      parseWithSchema(googleMobileAuthSchema, body),
      response,
    );
  }

  @Post('google')
  @HttpCode(200)
  @Throttle(authThrottle)
  async google(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    return this.authService.loginWithGoogle(parseWithSchema(googleAuthSchema, body), response);
  }

  @Post('google/complete-profile')
  @HttpCode(200)
  @Throttle(authThrottle)
  async googleCompleteProfile(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    return this.authService.completeGoogleProfile(
      parseWithSchema(googleCompleteProfileSchema, body),
      response,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: unknown,
  ) {
    const input = parseWithSchema(refreshSessionSchema, body ?? {});
    const refreshHeader = request.headers['x-refresh-token'];
    const headerRefreshToken = Array.isArray(refreshHeader) ? refreshHeader[0] : refreshHeader;

    return this.authService.refresh(
      input.refreshToken ?? headerRefreshToken ?? request.cookies?.[REFRESH_TOKEN_COOKIE],
      response,
      { client: input.client },
    );
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() body: unknown) {
    return this.authService.verifyEmail(parseWithSchema(verifyEmailSchema, body));
  }

  @Post('forgot-password')
  @HttpCode(200)
  @Throttle(forgotPasswordThrottle)
  async forgotPassword(@Body() body: unknown) {
    return this.authService.forgotPassword(parseWithSchema(forgotPasswordSchema, body));
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: unknown) {
    return this.authService.resetPassword(parseWithSchema(resetPasswordSchema, body));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async changePassword(@CurrentUser() user: JwtPayload, @Body() body: unknown) {
    return this.authService.changePassword(
      user.sub,
      parseWithSchema(changePasswordSchema, body),
    );
  }

  @Get('me')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ApiCacheInterceptor)
  @CacheConfig({ keyPrefix: 'auth:me', ttlSeconds: 30, varyByUser: true })
  async me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }
}
