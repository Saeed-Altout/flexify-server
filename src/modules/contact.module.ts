import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContactController } from '../controllers/contact.controller';
import { ContactService } from '../services/contact.service';
import { EmailService } from '../services/email.service';
import { SupabaseService } from '../services/supabase.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
          port: configService.get<number>('SMTP_PORT', 587),
          secure: configService.get<boolean>('SMTP_SECURE', false),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Portfolio Contact" <${configService.get<string>('SMTP_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ContactController],
  providers: [
    ContactService,
    EmailService,
    SupabaseService,
    AuthGuard,
    AdminGuard,
  ],
  exports: [ContactService, EmailService],
})
export class ContactModule {}
