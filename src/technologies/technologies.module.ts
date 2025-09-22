import { Module } from '@nestjs/common';
import { TechnologiesController } from './technologies.controller';
import { TechnologiesService } from './technologies.service';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [AuthModule, SupabaseModule, FileUploadModule],
  controllers: [TechnologiesController],
  providers: [TechnologiesService],
  exports: [TechnologiesService],
})
export class TechnologiesModule {}
