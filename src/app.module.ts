import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { CVBuilderModule } from './cv-builder/cv-builder.module';
import { ArduinoModule } from './arduino/arduino.module';
import { SupabaseModule } from './supabase/supabase.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    ProjectsModule,
    ContactModule,
    TechnologiesModule,
    CVBuilderModule,
    SupabaseModule,
    ArduinoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
