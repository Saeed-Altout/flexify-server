import { Module } from '@nestjs/common';
import { CVBuilderService } from './cv-builder.service';
import { CVBuilderController } from './cv-builder.controller';
import { SupabaseService } from '../supabase/supabase.service';
import { TechnologiesModule } from '../technologies/technologies.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileUploadService } from '../file-upload/file-upload.service';
import { FileUploadController } from '../file-upload/file-upload.controller';

@Module({
  imports: [TechnologiesModule],
  controllers: [CVBuilderController, FileUploadController],
  providers: [CVBuilderService, SupabaseService, AuthGuard, FileUploadService],
  exports: [CVBuilderService, FileUploadService],
})
export class CVBuilderModule {}
