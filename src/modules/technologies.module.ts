import { Module } from '@nestjs/common';
import { TechnologiesService } from '../services/technologies.service';
import { TechnologiesController } from '../controllers/technologies.controller';
import { SupabaseService } from '../services/supabase.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports: [],
  controllers: [TechnologiesController],
  providers: [TechnologiesService, SupabaseService, AuthGuard],
  exports: [TechnologiesService],
})
export class TechnologiesModule {}
