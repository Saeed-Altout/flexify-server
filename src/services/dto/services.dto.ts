import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Web Development',
    description: 'Service name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/icon.png',
    description: 'URL to service icon image',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  icon_url?: string;

  @ApiPropertyOptional({
    example: 'Professional web development services',
    description: 'Service description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/web-development',
    description: 'Service link/URL',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  href?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the service is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({
    example: 'Web Development',
    description: 'Service name',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/icon.png',
    description: 'URL to service icon image',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  icon_url?: string;

  @ApiPropertyOptional({
    example: 'Professional web development services',
    description: 'Service description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/web-development',
    description: 'Service link/URL',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  href?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the service is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ServiceQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: 'web development',
    description: 'Search term for name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'name',
    description: 'Sort by field',
    enum: ['name', 'is_active', 'created_at', 'updated_at'],
  })
  @IsOptional()
  @IsString()
  sort_by?: 'name' | 'is_active' | 'created_at' | 'updated_at';

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}
