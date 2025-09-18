import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
