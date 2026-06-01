import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { NotificationChannelType } from '@amg/shared';
import {
  NotificationChannel,
  NotificationPayload,
} from './notification-channel.interface';

@Injectable()
export class EmailChannel implements NotificationChannel {
  readonly type = NotificationChannelType.Email;
  private readonly logger = new Logger(EmailChannel.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'AMG Academy <no-reply@amgacademy.local>');
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async send(payload: NotificationPayload) {
    this.logger.log(`Queued email notification for user ${payload.userId}: ${payload.type}`);
  }

  async sendVerificationEmail(input: { to: string; name: string; verificationUrl: string }) {
    await this.sendTransactionalEmail({
      to: input.to,
      subject: 'Verify your AMG Academy account',
      html: `<p>Hello ${input.name},</p><p>Welcome to AMG Academy. Verify your email to activate your account.</p><p><a href="${input.verificationUrl}">Verify email</a></p>`,
      text: `Hello ${input.name}, verify your AMG Academy account: ${input.verificationUrl}`,
    });
  }

  async sendPasswordResetEmail(input: { to: string; name: string; resetUrl: string }) {
    await this.sendTransactionalEmail({
      to: input.to,
      subject: 'Reset your AMG Academy password',
      html: `<p>Hello ${input.name},</p><p>We received a password reset request for your AMG Academy account.</p><p><a href="${input.resetUrl}">Reset password</a></p>`,
      text: `Hello ${input.name}, reset your AMG Academy password: ${input.resetUrl}`,
    });
  }

  async sendWelcomeEmail(input: { to: string; name: string }) {
    await this.sendTransactionalEmail({
      to: input.to,
      subject: 'Welcome to AMG Academy',
      html: `<p>Hello ${input.name},</p><p>Your AMG Academy account is verified and ready to use.</p>`,
      text: `Hello ${input.name}, your AMG Academy account is verified and ready to use.`,
    });
  }

  private async sendTransactionalEmail(input: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }) {
    if (!this.resend) {
      this.logger.log(`Email transport not configured. Intended email to ${input.to}: ${input.subject}`);
      return;
    }

    await this.resend.emails.send({
      from: this.fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
