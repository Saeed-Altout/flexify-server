import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectCoverService } from './services/project-cover.service';
import { AuthModule } from '../auth/auth.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, FileUploadModule, SupabaseModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectCoverService],
  exports: [ProjectsService, ProjectCoverService],
})
export class ProjectsModule {}
