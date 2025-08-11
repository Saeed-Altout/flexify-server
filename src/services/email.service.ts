import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailTemplate } from '../types/contact.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendContactNotification(contactMessage: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      if (!adminEmail) {
        throw new Error('Admin email not configured');
      }

      const emailTemplate: EmailTemplate = {
        to: adminEmail,
        subject: `New Contact Message: ${contactMessage.subject}`,
        html: this.generateContactNotificationHTML(contactMessage),
        text: this.generateContactNotificationText(contactMessage),
      };

      await this.mailerService.sendMail(emailTemplate);
      this.logger.log(
        `Contact notification sent to admin for message from ${contactMessage.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send contact notification: ${error.message}`,
      );
      throw error;
    }
  }

  async sendReplyToUser(
    userEmail: string,
    userName: string,
    originalSubject: string,
    replyContent: string,
  ): Promise<void> {
    try {
      const emailTemplate: EmailTemplate = {
        to: userEmail,
        subject: `Re: ${originalSubject}`,
        html: this.generateReplyHTML(userName, originalSubject, replyContent),
        text: this.generateReplyText(userName, originalSubject, replyContent),
      };

      await this.mailerService.sendMail(emailTemplate);
      this.logger.log(`Reply sent to user ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send reply to user: ${error.message}`);
      throw error;
    }
  }

  private generateContactNotificationHTML(contactMessage: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Message</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
              New Contact Message Received
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">Message Details:</h3>
              <p><strong>From:</strong> ${contactMessage.name} (${contactMessage.email})</p>
              <p><strong>Subject:</strong> ${contactMessage.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db;">
                ${contactMessage.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <p style="color: #7f8c8d; font-size: 14px;">
              This message was sent from your portfolio contact form.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateContactNotificationText(contactMessage: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): string {
    return `
New Contact Message Received

Message Details:
From: ${contactMessage.name} (${contactMessage.email})
Subject: ${contactMessage.subject}
Message:
${contactMessage.message}

This message was sent from your portfolio contact form.
    `;
  }

  private generateReplyHTML(
    userName: string,
    originalSubject: string,
    replyContent: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reply to your message</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
              Reply to your message
            </h2>
            
            <p>Hello ${userName},</p>
            
            <p>Thank you for reaching out to me. Here's my reply to your message regarding:</p>
            <h3 style="color: #2c3e50;">"${originalSubject}"</h3>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${replyContent.replace(/\n/g, '<br>')}
            </div>
            
            <p>Best regards,<br>Your Name</p>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
            <p style="color: #7f8c8d; font-size: 12px;">
              This is a reply to your message sent through my portfolio contact form.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateReplyText(
    userName: string,
    originalSubject: string,
    replyContent: string,
  ): string {
    return `
Reply to your message

Hello ${userName},

Thank you for reaching out to me. Here's my reply to your message regarding:
"${originalSubject}"

${replyContent}

Best regards,
Your Name

---
This is a reply to your message sent through my portfolio contact form.
    `;
  }
}
