import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateTechnologyDto {
  @ApiProperty({
    example: 'React',
    description: 'Technology name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'A JavaScript library for building user interfaces',
    description: 'Technology description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Frontend',
    description: 'Technology category',
  })
  @IsString()
  category: string;

  @ApiProperty({
    example: true,
    description: 'Whether the technology is active',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTechnologyDto {
  @ApiProperty({
    example: 'React',
    description: 'Technology name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'A JavaScript library for building user interfaces',
    description: 'Technology description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Frontend',
    description: 'Technology category',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the technology is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class TechnologyQueryDto {
  @ApiProperty({
    example: 'Frontend',
    description: 'Filter by category',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: true,
    description: 'Filter by active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    example: 'react',
    description: 'Search term for name or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    example: 10,
    description: 'Items per page',
    required: false,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    example: 'name',
    description: 'Sort by field',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiProperty({
    example: 'asc',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}

export class TechnologyDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Technology ID',
  })
  id: string;

  @ApiProperty({
    example: 'React',
    description: 'Technology name',
  })
  name: string;

  @ApiProperty({
    example: 'A JavaScript library for building user interfaces',
    description: 'Technology description',
  })
  description?: string;

  @ApiProperty({
    example: 'Frontend',
    description: 'Technology category',
  })
  category: string;

  @ApiProperty({
    example: 'https://example.com/react-icon.png',
    description: 'Technology icon URL',
  })
  icon_url?: string;

  @ApiProperty({
    example: 'react-icon.png',
    description: 'Technology icon filename',
  })
  icon_filename?: string;

  @ApiProperty({
    example: 1024,
    description: 'Technology icon size in bytes',
  })
  icon_size?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the technology is active',
  })
  is_active: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  created_at: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update timestamp',
  })
  updated_at: string;
}

export class TechnologyListResponseDto {
  @ApiProperty({
    type: [TechnologyDto],
    description: 'List of technologies',
  })
  technologies: TechnologyDto[];

  @ApiProperty({
    example: 50,
    description: 'Total number of technologies',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Items per page',
  })
  limit: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of pages',
  })
  total_pages: number;
}

export class StandardResponseDto<T> {
  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    example: 'success',
    description: 'Response status',
  })
  status: string;
}
