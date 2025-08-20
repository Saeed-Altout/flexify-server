import { IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunDeviceDto {
  @ApiProperty({
    description: 'Command to run the device',
    example: 'on',
    enum: ['on'],
  })
  @IsString()
  @IsIn(['on'])
  command: 'on';
}

export class SendCommandDto {
  @ApiProperty({
    description: 'Command to send to the device',
    example: 'bottom',
    enum: ['bottom', 'top', 'both'],
  })
  @IsString()
  @IsIn(['bottom', 'top', 'both'])
  command: 'bottom' | 'top' | 'both';

  @ApiProperty({
    description: 'Time in minutes for the command',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  time: number;
}

export class StopDeviceDto {
  @ApiProperty({
    description: 'Command to stop the device',
    example: 'off',
    enum: ['off'],
  })
  @IsString()
  @IsIn(['off'])
  command: 'off';
}

export class ArduinoStatusResponseDto {
  @ApiProperty({
    description: 'Device ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Device name',
    example: 'Main Arduino',
  })
  device_name: string;

  @ApiProperty({
    description: 'Device type',
    example: 'Arduino Uno',
  })
  device_type: string;

  @ApiProperty({
    description: 'Connection status',
    example: true,
  })
  is_connected: boolean;

  @ApiProperty({
    description: 'Last seen timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  last_seen: string;

  @ApiProperty({
    description: 'Device status',
    example: 'online',
    enum: ['online', 'offline', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  updated_at: string;
}

export class CommandResponseDto {
  @ApiProperty({
    description: 'Command ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Device ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  device_id: string;

  @ApiProperty({
    description: 'Command type',
    example: 'send',
    enum: ['on', 'off', 'send'],
  })
  command_type: string;

  @ApiProperty({
    description: 'Command',
    example: 'off',
  })
  command: string;

  @ApiPropertyOptional({
    description: 'Time in minutes',
    example: 5,
  })
  time_minutes?: number;

  @ApiProperty({
    description: 'Command status',
    example: 'pending',
    enum: ['pending', 'executing', 'completed', 'failed'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Execution timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  executed_at?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  updated_at: string;
}
