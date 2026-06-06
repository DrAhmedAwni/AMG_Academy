import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus as PrismaUserStatus } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { google } from 'googleapis';
import type { StringValue } from 'ms';
import type { AuthTokenPair, AuthUser, JwtPayload } from '@amg/shared';
import { PrismaService } from '../prisma/prisma.service';
import { EmailChannel } from '../notifications/channels/email.channel';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../common/constants/auth.constants';
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  GoogleAuthDto,
  GoogleCompleteProfileDto,
  GoogleMobileAuthDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';

type UserWithRole = Awaited<ReturnType<AuthService['getUserWithRoleAndPermissions']>>;
type AuthTokenMaterial = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly accessTokenMs: number;
  private readonly refreshTokenMs: number;
  private readonly frontendUrl: string;
  private readonly apiPrefix: string;
  private readonly isProduction: boolean;

  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtResetSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailChannel: EmailChannel,
  ) {
    this.jwtSecret = this.requireSecret('auth.jwtSecret');
    this.jwtRefreshSecret = this.requireSecret('auth.jwtRefreshSecret');
    this.jwtResetSecret = this.requireSecret('auth.jwtResetSecret');
    this.accessTokenMs = this.parseDurationToMs(
      this.configService.get<string>('auth.accessTokenTtl', '15m'),
      15 * 60 * 1000,
    );
    this.refreshTokenMs = this.parseDurationToMs(
      this.configService.get<string>('auth.refreshTokenTtl', '7d'),
      7 * 24 * 60 * 60 * 1000,
    );
    this.frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');
    this.apiPrefix = this.configService.get<string>('app.apiPrefix', 'api/v1');
    this.isProduction = this.configService.get<string>('app.nodeEnv', 'development') === 'production';
  }

  private requireSecret(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value || value.length < 32) {
      throw new Error(
        `Missing or insecure JWT secret: ${key}. Must be at least 32 characters. Set it in your environment configuration.`,
      );
    }
    return value;
  }

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const defaultRole = await this.prisma.role.findUnique({
      where: { slug: 'user' },
    });

    if (!defaultRole) {
      throw new InternalServerErrorException('Default user role is not configured');
    }

    const passwordHash = await hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        password: passwordHash,
        phone: input.phone,
        specialty: input.specialty,
        clinic: input.clinic,
        city: input.city,
        professionalTitle: input.professionalTitle,
        practiceType: input.practiceType,
        yearsOfExperience: input.yearsOfExperience,
        roleId: defaultRole.id,
      },
    });

    const verificationToken = await this.createEmailVerificationToken(user.id, user.email);
    const verificationUrl = this.buildEmailVerificationUrl(verificationToken);

    await this.emailChannel.sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: defaultRole.slug,
      createdAt: user.createdAt.toISOString(),
      ...(!this.isProduction ? { verificationUrl } : {}),
    };
  }

  async login(input: LoginDto, response: Response) {
    const email = input.email.trim().toLowerCase();
    const user = await this.getUserWithRoleAndPermissions({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await compare(input.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.ensureAccountIsActive(user);

    if (!user.emailVerified) {
      if (!this.isProduction) {
        const verificationToken = await this.createEmailVerificationToken(user.id, user.email);
        throw new UnauthorizedException({
          message: 'Please verify your email before signing in',
          details: {
            verificationUrl: this.buildEmailVerificationUrl(verificationToken),
          },
        });
      }

      throw new UnauthorizedException('Please verify your email before signing in');
    }

    const tokens = await this.createAuthTokens(user);
    this.writeAuthCookies(response, tokens);

    return {
      user: this.mapAuthUser(user),
      ...(input.client === 'mobile' ? { tokens: this.toMobileTokenPair(tokens) } : {}),
    };
  }

  async loginWithGoogle(input: GoogleAuthDto | GoogleMobileAuthDto, response: Response) {
    const googleProfile = await this.verifyGoogleIdToken(input.idToken);
    const email = googleProfile.email.trim().toLowerCase();
    const displayName = googleProfile.name?.trim() || email.split('@')[0] || 'AMG Learner';

    let user = await this.getUserWithRoleAndPermissions({ email });
    if (!user) {
      return {
        needsProfile: true,
        profile: {
          email,
          name: displayName,
          avatarUrl: googleProfile.picture ?? null,
        },
      };
    }

    this.ensureAccountIsActive(user);

    if (!this.hasRequiredGoogleProfile(user)) {
      return {
        needsProfile: true,
        profile: {
          email,
          name: user.name || displayName,
          phone: user.phone,
          specialty: user.specialty,
          clinic: user.clinic,
          city: user.city,
          professionalTitle: user.professionalTitle,
          practiceType: user.practiceType,
          yearsOfExperience: user.yearsOfExperience,
          avatarUrl: user.avatarUrl ?? googleProfile.picture ?? null,
        },
      };
    }

    if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });
      user = await this.getUserWithRoleAndPermissions({ id: user.id });
    }

    if (!user) {
      throw new UnauthorizedException('Google sign-in could not create a session');
    }

    const tokens = await this.createAuthTokens(user);
    this.writeAuthCookies(response, tokens);

    return {
      user: this.mapAuthUser(user),
      ...(input.client === 'mobile' ? { tokens: this.toMobileTokenPair(tokens) } : {}),
    };
  }

  async completeGoogleProfile(input: GoogleCompleteProfileDto, response: Response) {
    const googleProfile = await this.verifyGoogleIdToken(input.idToken);
    const email = googleProfile.email.trim().toLowerCase();
    const defaultRole = await this.prisma.role.findUnique({ where: { slug: 'user' } });

    if (!defaultRole) {
      throw new InternalServerErrorException('Default user role is not configured');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.status === PrismaUserStatus.DISABLED || existingUser.status === PrismaUserStatus.DELETED) {
        throw new ForbiddenException('This account is not active');
      }

      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: input.name.trim(),
          phone: input.phone,
          specialty: input.specialty,
          clinic: input.clinic,
          city: input.city,
          professionalTitle: input.professionalTitle,
          practiceType: input.practiceType,
          yearsOfExperience: input.yearsOfExperience,
          avatarUrl: existingUser.avatarUrl ?? googleProfile.picture ?? null,
          emailVerified: true,
          emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          name: input.name.trim(),
          email,
          password: await hash(randomUUID(), 12),
          phone: input.phone,
          specialty: input.specialty,
          clinic: input.clinic,
          city: input.city,
          professionalTitle: input.professionalTitle,
          practiceType: input.practiceType,
          yearsOfExperience: input.yearsOfExperience,
          avatarUrl: googleProfile.picture ?? null,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          roleId: defaultRole.id,
        },
      });
    }

    const user = await this.getUserWithRoleAndPermissions({ email });
    if (!user) {
      throw new UnauthorizedException('Google sign-in could not create a session');
    }

    this.ensureAccountIsActive(user);
    const tokens = await this.createAuthTokens(user);
    this.writeAuthCookies(response, tokens);

    return {
      user: this.mapAuthUser(user),
      ...(input.client === 'mobile' ? { tokens: this.toMobileTokenPair(tokens) } : {}),
    };
  }

  private async verifyGoogleIdToken(idToken: string) {
    const clientIds = [
      this.configService.get<string>('auth.googleWebClientId'),
      this.configService.get<string>('auth.googleAndroidClientId'),
      this.configService.get<string>('auth.googleIosClientId'),
    ].filter((value): value is string => Boolean(value));

    if (clientIds.length === 0) {
      throw new InternalServerErrorException('Google sign-in is not configured');
    }

    let payload:
      | { email?: string; email_verified?: boolean; name?: string; picture?: string }
      | undefined;
    try {
      const ticket = await new google.auth.OAuth2().verifyIdToken({
        idToken,
        audience: clientIds,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Google sign-in could not be verified');
    }

    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }

  async logout(response: Response) {
    this.clearAuthCookies(response);
    return null;
  }

  async refresh(
    refreshToken: string | undefined,
    response: Response,
    options: { client?: 'web' | 'mobile' } = {},
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    let payload: { sub: string; type?: string; tokenVersion?: number };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const user = await this.getUserWithRoleAndPermissions({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    this.ensureAccountIsActive(user);
    const accessToken = await this.createAccessToken(user);
    this.writeAccessCookie(response, accessToken);

    return options.client === 'mobile'
      ? {
          tokens: this.toMobileTokenPair({
            accessToken,
            refreshToken,
          }),
        }
      : null;
  }

  async verifyEmail(input: VerifyEmailDto) {
    let payload: { sub: string; email: string; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(input.token, {
        secret: this.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Verification token is invalid or expired');
    }

    if (payload.type !== 'email_verification') {
      throw new UnauthorizedException('Verification token is invalid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      await this.emailChannel.sendWelcomeEmail({
        to: user.email,
        name: user.name,
      });
    }

    return {
      verified: true,
      email: user.email,
    };
  }

  async forgotPassword(input: ForgotPasswordDto) {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.status === PrismaUserStatus.ACTIVE && user.emailVerified) {
      const resetToken = await this.createPasswordResetToken(user.id, user.email);
      await this.emailChannel.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: `${this.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`,
      });
    }

    return {
      message: 'If the email exists, a reset link has been sent',
    };
  }

  async resetPassword(input: ResetPasswordDto) {
    let payload: { sub: string; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(input.token, {
        secret: this.jwtResetSecret,
      });
    } catch {
      throw new UnauthorizedException('Reset token is invalid or expired');
    }

    if (payload.type !== 'password_reset') {
      throw new UnauthorizedException('Reset token is invalid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(input.password, 12),
        tokenVersion: { increment: 1 },
      },
    });

    return {
      message: 'Password reset successful',
    };
  }

  async changePassword(userId: string, input: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const passwordMatches = await compare(input.currentPassword, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(input.newPassword, 12),
        tokenVersion: { increment: 1 },
      },
    });

    return {
      message: 'Password updated successfully',
    };
  }

  async me(userId: string) {
    const user = await this.getUserWithRoleAndPermissions({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    this.ensureAccountIsActive(user);
    return this.mapAuthUser(user);
  }

  private async getUserWithRoleAndPermissions(where: { id?: string; email?: string }) {
    return this.prisma.user.findFirst({
      where,
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  private async getUserWithTokenVersion(where: { id?: string; email?: string }) {
    return this.prisma.user.findFirst({
      where,
      select: { id: true, email: true, status: true, tokenVersion: true },
    });
  }

  private ensureAccountIsActive(user: NonNullable<UserWithRole>) {
    if (user.status === PrismaUserStatus.DISABLED || user.status === PrismaUserStatus.DELETED) {
      throw new ForbiddenException('This account is not active');
    }
  }

  private hasRequiredGoogleProfile(user: NonNullable<UserWithRole>) {
    return [user.name, user.phone, user.specialty, user.clinic, user.city].every(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );
  }

  private mapAuthUser(user: NonNullable<UserWithRole>): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.slug,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      permissions: user.role.permissions.map(
        (entry) => `${entry.permission.module}:${entry.permission.action}`,
      ),
    };
  }

  private buildJwtPayload(user: NonNullable<UserWithRole>): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role.slug,
      tokenVersion: user.tokenVersion,
      permissions: user.role.permissions.map(
        (entry) => `${entry.permission.module}:${entry.permission.action}`,
      ),
    };
  }

  private async createAuthTokens(user: NonNullable<UserWithRole>): Promise<AuthTokenMaterial> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);

    return { accessToken, refreshToken };
  }

  private async createAccessToken(user: NonNullable<UserWithRole>) {
    const payload = this.buildJwtPayload(user);
    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.configService.get<string>('auth.accessTokenTtl', '15m') as StringValue,
    });
  }

  private async createRefreshToken(user: NonNullable<UserWithRole>) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
        tokenVersion: user.tokenVersion,
      },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.configService.get<string>('auth.refreshTokenTtl', '7d') as StringValue,
      },
    );
  }

  private writeAuthCookies(response: Response, tokens: AuthTokenMaterial) {
    this.writeAccessCookie(response, tokens.accessToken);
    this.writeRefreshCookie(response, tokens.refreshToken);
  }

  private writeAccessCookie(response: Response, token: string) {
    response.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      path: '/',
      maxAge: this.accessTokenMs,
    });
  }

  private writeRefreshCookie(response: Response, token: string) {
    response.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      path: `/${this.apiPrefix}/auth/refresh`,
      maxAge: this.refreshTokenMs,
    });
  }

  private toMobileTokenPair(tokens: Partial<AuthTokenMaterial> & { accessToken: string }): AuthTokenPair {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresInSeconds: Math.floor(this.accessTokenMs / 1000),
      refreshExpiresInSeconds: tokens.refreshToken
        ? Math.floor(this.refreshTokenMs / 1000)
        : undefined,
    };
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      path: '/',
    });
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      path: `/${this.apiPrefix}/auth/refresh`,
    });
  }

  private async createEmailVerificationToken(userId: string, email: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
        type: 'email_verification',
      },
        {
          secret: this.jwtSecret,
          expiresIn: '24h' as StringValue,
        },
      );
  }

  private buildEmailVerificationUrl(token: string) {
    return `${this.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  }

  private async createPasswordResetToken(userId: string, email: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        email,
        type: 'password_reset',
      },
        {
          secret: this.jwtResetSecret,
          expiresIn: '1h' as StringValue,
        },
      );
  }

  private parseDurationToMs(value: string, fallback: number) {
    const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());
    if (!match) {
      return fallback;
    }

    const amount = Number(match[1]);
    const multipliers = {
      ms: 1,
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    const unit = match[2] as keyof typeof multipliers;

    return amount * (multipliers[unit] ?? 1);
  }
}
