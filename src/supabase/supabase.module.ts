import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CustomAuthService } from './custom-auth.service';

@Global()
@Module({
  providers: [SupabaseService, CustomAuthService],
  exports: [SupabaseService, CustomAuthService],
})
export class SupabaseModule {}
