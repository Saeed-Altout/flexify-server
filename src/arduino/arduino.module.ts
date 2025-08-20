import { Module } from '@nestjs/common';
import { ArduinoController } from './arduino.controller';
import { ArduinoService } from './arduino.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ArduinoController],
  providers: [ArduinoService],
  exports: [ArduinoService],
})
export class ArduinoModule {}
