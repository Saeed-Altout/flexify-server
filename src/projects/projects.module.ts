import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectImageService } from './services/project-image.service';
import { AuthModule } from '../auth/auth.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, FileUploadModule, SupabaseModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectImageService],
  exports: [ProjectsService, ProjectImageService],
})
export class ProjectsModule {}
