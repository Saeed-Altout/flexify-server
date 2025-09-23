import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService, SupabaseService, AuthGuard],
  exports: [AuthService, EmailService, AuthGuard],
})
export class AuthModule {}
