import { Module } from '@nestjs/common';
import { CVBuilderService } from '../services/cv-builder.service';
import { CVBuilderController } from '../controllers/cv-builder.controller';
import { SupabaseService } from '../services/supabase.service';
import { TechnologiesModule } from './technologies.module';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [TechnologiesModule],
  controllers: [CVBuilderController],
  providers: [CVBuilderService, SupabaseService, AuthGuard],
  exports: [CVBuilderService],
})
export class CVBuilderModule {}
