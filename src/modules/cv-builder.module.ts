import { Module } from '@nestjs/common';
import { CVBuilderService } from '../services/cv-builder.service';
import { CVBuilderController } from '../controllers/cv-builder.controller';
import { SupabaseService } from '../services/supabase.service';
import { TechnologiesModule } from './technologies.module';
import { AuthGuard } from '../guards/auth.guard';
import { FileUploadService } from '../services/file-upload.service';
import { FileUploadController } from '../controllers/file-upload.controller';

@Module({
  imports: [TechnologiesModule],
  controllers: [CVBuilderController, FileUploadController],
  providers: [CVBuilderService, SupabaseService, AuthGuard, FileUploadService],
  exports: [CVBuilderService, FileUploadService],
})
export class CVBuilderModule {}
