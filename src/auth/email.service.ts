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
      host:
        this.configService.get<string>('email.smtpHost') || 'smtp.gmail.com',
      port: this.configService.get<number>('email.smtpPort') || 465,
      secure: this.configService.get<boolean>('email.smtpSecure') || true,
      auth: {
        user: this.configService.get<string>('email.smtpUser'),
        pass: this.configService.get<string>('email.smtpPass'),
      },
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      this.logger.warn(
        'Email configuration is missing. Email functionality will be disabled.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport(emailConfig);
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
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account - Flexify</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6; 
            color: #0f172a; 
            background-color: #f8fafc;
            padding: 20px;
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white; 
            padding: 32px 24px; 
            text-align: center;
          }
          .header h1 { 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px;
            letter-spacing: -0.025em;
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.9;
            font-weight: 400;
          }
          .content { 
            padding: 40px 24px; 
          }
          .greeting { 
            font-size: 20px; 
            font-weight: 600; 
            color: #0f172a; 
            margin-bottom: 16px;
          }
          .description { 
            font-size: 16px; 
            color: #475569; 
            margin-bottom: 32px;
            line-height: 1.6;
          }
          .otp-container { 
            background: #f1f5f9; 
            border: 2px solid #e2e8f0;
            border-radius: 12px; 
            padding: 24px; 
            text-align: center; 
            margin: 32px 0;
          }
          .otp-label { 
            font-size: 14px; 
            color: #64748b; 
            font-weight: 500; 
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .otp-code { 
            background: #0f172a; 
            color: #f8fafc; 
            font-size: 36px; 
            font-weight: 700; 
            text-align: center; 
            padding: 20px; 
            border-radius: 8px; 
            letter-spacing: 8px; 
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .expiry-notice { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 24px 0;
            text-align: center;
          }
          .expiry-notice p { 
            color: #92400e; 
            font-weight: 500; 
            margin: 0;
            font-size: 14px;
          }
          .security-notice { 
            background: #f0f9ff; 
            border: 1px solid #0ea5e9; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 24px 0;
          }
          .security-notice p { 
            color: #0c4a6e; 
            font-size: 14px; 
            margin: 0;
            line-height: 1.5;
          }
          .footer { 
            background: #f8fafc; 
            padding: 24px; 
            text-align: center; 
            border-top: 1px solid #e2e8f0;
          }
          .footer p { 
            color: #64748b; 
            font-size: 14px; 
            margin-bottom: 8px;
          }
          .footer a { 
            color: #6366f1; 
            text-decoration: none; 
            font-weight: 500;
          }
          .footer a:hover { 
            text-decoration: underline; 
          }
          .signature { 
            margin-top: 24px; 
            padding-top: 24px; 
            border-top: 1px solid #e2e8f0;
          }
          .signature p { 
            color: #475569; 
            font-size: 16px; 
            margin: 0;
          }
          .team-name { 
            font-weight: 600; 
            color: #0f172a;
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 24px 16px; }
            .header { padding: 24px 16px; }
            .otp-code { font-size: 28px; letter-spacing: 6px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Welcome to Flexify</h1>
            <p>Complete your account verification</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${name}!</div>
            <div class="description">
              Thank you for joining Flexify! To complete your account setup and ensure the security of your account, please verify your email address using the verification code below.
            </div>
            
            <div class="otp-container">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-notice">
              <p>⏰ This code will expire in 10 minutes for security reasons</p>
            </div>
            
            <div class="security-notice">
              <p><strong>Security Notice:</strong> If you didn't create an account with Flexify, please ignore this email. Your email address will not be used for any purpose. We take your privacy seriously and will never share your information with third parties.</p>
            </div>
            
            <div class="signature">
              <p>Best regards,<br><span class="team-name">The Flexify Team</span></p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Flexify. All rights reserved.</p>
            <p>
              <a href="#">Privacy Policy</a> • 
              <a href="#">Terms of Service</a> • 
              <a href="#">Contact Support</a>
            </p>
            <p style="margin-top: 12px; font-size: 12px; color: #94a3b8;">
              This email was sent to you because you signed up for a Flexify account. 
              If you have any questions, please contact our support team.
            </p>
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
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Flexify</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6; 
            color: #0f172a; 
            background-color: #f8fafc;
            padding: 20px;
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white; 
            padding: 32px 24px; 
            text-align: center;
          }
          .header h1 { 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px;
            letter-spacing: -0.025em;
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.9;
            font-weight: 400;
          }
          .content { 
            padding: 40px 24px; 
          }
          .greeting { 
            font-size: 20px; 
            font-weight: 600; 
            color: #0f172a; 
            margin-bottom: 16px;
          }
          .description { 
            font-size: 16px; 
            color: #475569; 
            margin-bottom: 32px;
            line-height: 1.6;
          }
          .button-container { 
            text-align: center; 
            margin: 32px 0;
          }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            transition: all 0.2s ease;
          }
          .button:hover { 
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgb(0 0 0 / 0.15);
          }
          .expiry-notice { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 24px 0;
            text-align: center;
          }
          .expiry-notice p { 
            color: #92400e; 
            font-weight: 500; 
            margin: 0;
            font-size: 14px;
          }
          .security-notice { 
            background: #f0f9ff; 
            border: 1px solid #0ea5e9; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 24px 0;
          }
          .security-notice p { 
            color: #0c4a6e; 
            font-size: 14px; 
            margin: 0;
            line-height: 1.5;
          }
          .warning-notice { 
            background: #fef2f2; 
            border: 1px solid #fca5a5; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 24px 0;
          }
          .warning-notice p { 
            color: #991b1b; 
            font-size: 14px; 
            margin: 0;
            line-height: 1.5;
          }
          .footer { 
            background: #f8fafc; 
            padding: 24px; 
            text-align: center; 
            border-top: 1px solid #e2e8f0;
          }
          .footer p { 
            color: #64748b; 
            font-size: 14px; 
            margin-bottom: 8px;
          }
          .footer a { 
            color: #dc2626; 
            text-decoration: none; 
            font-weight: 500;
          }
          .footer a:hover { 
            text-decoration: underline; 
          }
          .signature { 
            margin-top: 24px; 
            padding-top: 24px; 
            border-top: 1px solid #e2e8f0;
          }
          .signature p { 
            color: #475569; 
            font-size: 16px; 
            margin: 0;
          }
          .team-name { 
            font-weight: 600; 
            color: #0f172a;
          }
          .url-fallback { 
            background: #f1f5f9; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 16px 0;
            word-break: break-all;
          }
          .url-fallback p { 
            color: #64748b; 
            font-size: 12px; 
            margin: 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 24px 16px; }
            .header { padding: 24px 16px; }
            .button { padding: 14px 24px; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Secure your account</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${name}!</div>
            <div class="description">
              We received a request to reset your password for your Flexify account. If you made this request, click the button below to set a new password.
            </div>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <div class="expiry-notice">
              <p>⏰ This link will expire in 1 hour for security reasons</p>
            </div>
            
            <div class="url-fallback">
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p>${resetUrl}</p>
            </div>
            
            <div class="security-notice">
              <p><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged. We take your account security seriously and will never share your information with third parties.</p>
            </div>
            
            <div class="warning-notice">
              <p><strong>Important:</strong> If you continue to receive password reset emails that you didn't request, please contact our support team immediately. This could indicate unauthorized access attempts to your account.</p>
            </div>
            
            <div class="signature">
              <p>Best regards,<br><span class="team-name">The Flexify Team</span></p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Flexify. All rights reserved.</p>
            <p>
              <a href="#">Privacy Policy</a> • 
              <a href="#">Terms of Service</a> • 
              <a href="#">Contact Support</a>
            </p>
            <p style="margin-top: 12px; font-size: 12px; color: #94a3b8;">
              This email was sent to you because a password reset was requested for your Flexify account. 
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
