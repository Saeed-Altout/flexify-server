import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { AuthModule } from '../auth/auth.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, FileUploadModule, SupabaseModule],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
