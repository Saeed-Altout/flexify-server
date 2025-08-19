import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TechnologiesModule } from '../technologies/technologies.module';

@Module({
  imports: [TechnologiesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, SupabaseService, AuthGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
