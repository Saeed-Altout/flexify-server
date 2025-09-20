import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTechnologyDto {
  @ApiProperty({ example: 'React', description: 'Technology name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'A JavaScript library for building user interfaces',
    description: 'Technology description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Frontend',
    description: 'Technology category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/react-icon.png',
    description: 'Icon URL',
  })
  @IsOptional()
  @IsString()
  icon_url?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is technology active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTechnologyDto {
  @ApiPropertyOptional({ example: 'React', description: 'Technology name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'A JavaScript library for building user interfaces',
    description: 'Technology description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Frontend',
    description: 'Technology category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/react-icon.png',
    description: 'Icon URL',
  })
  @IsOptional()
  @IsString()
  icon_url?: string;

  @ApiPropertyOptional({ example: true, description: 'Is technology active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class TechnologyQueryDto {
  @ApiPropertyOptional({
    example: 'Frontend',
    description: 'Filter by category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 'react', description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'name',
    enum: ['name', 'category', 'created_at'],
    description: 'Sort by field',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'category', 'created_at'])
  sort_by?: 'name' | 'category' | 'created_at';

  @ApiPropertyOptional({
    example: 'asc',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}

export class TechnologyDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Technology ID',
  })
  id: string;

  @ApiProperty({ example: 'React', description: 'Technology name' })
  name: string;

  @ApiPropertyOptional({
    example: 'A JavaScript library for building user interfaces',
    description: 'Technology description',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'Frontend',
    description: 'Technology category',
  })
  category?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/react-icon.png',
    description: 'Icon URL',
  })
  icon_url?: string;

  @ApiProperty({ example: true, description: 'Is technology active' })
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
  @ApiProperty({ type: [TechnologyDto], description: 'List of technologies' })
  technologies: TechnologyDto[];

  @ApiProperty({ example: 50, description: 'Total number of technologies' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  total_pages: number;
}

export class StandardResponseDto<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: 'Success message', description: 'Response message' })
  message: string;

  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;
}
