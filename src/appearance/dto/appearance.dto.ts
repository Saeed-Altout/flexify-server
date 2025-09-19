import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';
import type {
  Theme,
  TimeFormat,
  Language,
  DateFormat,
} from '../types/appearance.types';

export class UpdateAppearanceDto {
  @ApiPropertyOptional({
    example: 'dark',
    description: 'User theme preference',
    enum: ['light', 'dark', 'system'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'system'])
  theme?: Theme;

  @ApiPropertyOptional({
    example: 'America/New_York',
    description: 'User timezone (e.g., UTC, America/New_York, Europe/London)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({
    example: '12',
    description: 'Time format preference',
    enum: ['12', '24'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['12', '24'])
  time_format?: TimeFormat;

  @ApiPropertyOptional({
    example: 'en',
    description: 'User language preference (ISO 639-1 code)',
    enum: ['en', 'ar', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'ar', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'])
  language?: Language;

  @ApiPropertyOptional({
    example: 'MM/DD/YYYY',
    description: 'Date format preference',
    enum: [
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'YYYY-MM-DD',
      'DD-MM-YYYY',
      'MM-DD-YYYY',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'])
  date_format?: DateFormat;
}

export class AppearanceSettingsDto {
  @ApiProperty({
    example: 'dark',
    description: 'User theme preference',
    enum: ['light', 'dark', 'system'],
  })
  theme: Theme;

  @ApiProperty({
    example: 'America/New_York',
    description: 'User timezone',
  })
  timezone: string;

  @ApiProperty({
    example: '12',
    description: 'Time format preference',
    enum: ['12', '24'],
  })
  time_format: TimeFormat;

  @ApiProperty({
    example: 'en',
    description: 'User language preference',
    enum: ['en', 'ar', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
  })
  language: Language;

  @ApiProperty({
    example: 'MM/DD/YYYY',
    description: 'Date format preference',
    enum: [
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'YYYY-MM-DD',
      'DD-MM-YYYY',
      'MM-DD-YYYY',
    ],
  })
  date_format: DateFormat;
}

export class StandardResponseDto<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: 'Success message', description: 'Response message' })
  message: string;

  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;
}
