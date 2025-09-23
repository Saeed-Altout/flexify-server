import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('email.host') || 'smtp.gmail.com',
      port: this.configService.get<number>('email.port') || 587,
      secure: this.configService.get<boolean>('email.secure') || false,
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.password'),
      },
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      this.logger.warn(
        'Email configuration is missing. Email functionality will be disabled.',
      );
      return;
    }

    this.transporter = nodemailer.createTransporter(emailConfig);
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    name: string,
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn(
          'Email transporter not configured. Skipping email send.',
        );
        return false;
      }

      const mailOptions = {
        from:
          this.configService.get<string>('email.from') || 'noreply@flexify.com',
        to: email,
        subject: 'Verify Your Account - Flexify',
        html: this.getOtpEmailTemplate(name, otp),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send OTP email to ${email}: ${error.message}`,
      );
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    name: string,
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn(
          'Email transporter not configured. Skipping email send.',
        );
        return false;
      }

      const resetUrl = `${this.configService.get<string>('app.frontendUrl')}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from:
          this.configService.get<string>('email.from') || 'noreply@flexify.com',
        to: email,
        subject: 'Reset Your Password - Flexify',
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
      );
      return false;
    }
  }

  private getOtpEmailTemplate(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-code { background: #1f2937; color: #f9fafb; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Flexify!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for signing up with Flexify. To complete your account setup, please verify your email address using the code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            
            <p>If you didn't create an account with Flexify, please ignore this email.</p>
            
            <p>Best regards,<br>The Flexify Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Flexify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(
    name: string,
    resetUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your password for your Flexify account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>For security reasons, if you continue to receive these emails, please contact our support team.</p>
            
            <p>Best regards,<br>The Flexify Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Flexify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
