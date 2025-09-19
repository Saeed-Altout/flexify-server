import { Module } from '@nestjs/common';
import { AppearanceController } from './appearance.controller';
import { AppearanceService } from './appearance.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AppearanceController],
  providers: [AppearanceService],
  exports: [AppearanceService],
})
export class AppearanceModule {}
