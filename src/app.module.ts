import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { MessagesModule } from './messages/messages.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { ImagesModule } from './images/images.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { AppearanceModule } from './appearance/appearance.module';
import { SupabaseModule } from './supabase/supabase.module';
import { HealthModule } from './health/health.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SupabaseModule,
    AuthModule,
    TechnologiesModule,
    ProjectsModule,
    ImagesModule,
    MessagesModule,
    FileUploadModule,
    AppearanceModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
