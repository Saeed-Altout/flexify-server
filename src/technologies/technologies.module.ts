import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TechnologiesController } from './technologies.controller';
import { TechnologiesService } from './technologies.service';
import { TechnologiesCorsMiddleware } from './technologies-cors.middleware';
import { AuthModule } from '../auth/auth.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, FileUploadModule, SupabaseModule],
  controllers: [TechnologiesController],
  providers: [TechnologiesService],
  exports: [TechnologiesService],
})
export class TechnologiesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TechnologiesCorsMiddleware)
      .forRoutes(TechnologiesController);
  }
}
