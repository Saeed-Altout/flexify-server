import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { TechnologiesController } from './technologies.controller';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports: [],
  controllers: [TechnologiesController],
  providers: [TechnologiesService, SupabaseService, AuthGuard],
  exports: [TechnologiesService],
})
export class TechnologiesModule {}
