import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectsService } from '../services/projects.service';
import { ProjectsController } from '../controllers/projects.controller';
import { SupabaseService } from '../services/supabase.service';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [ConfigModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, SupabaseService, AuthGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
