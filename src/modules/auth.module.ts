import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, AuthGuard],
  exports: [AuthService, SupabaseService, AuthGuard],
})
export class AuthModule {}
