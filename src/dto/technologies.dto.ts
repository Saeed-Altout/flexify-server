import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsString as IsStringValidator,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StandardResponseDto } from './auth.dto';

export class CreateTechnologyDto {
  @ApiProperty({
    description: 'Technology label (display name)',
    example: 'React.js',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @ApiProperty({
    description: 'Technology value (unique identifier)',
    example: 'react',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  value: string;
}

export class UpdateTechnologyDto {
  @ApiPropertyOptional({
    description: 'Technology label (display name)',
    example: 'React.js',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({
    description: 'Technology value (unique identifier)',
    example: 'react',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  value?: string;
}

export class TechnologyResponseDto {
  @ApiProperty({ description: 'Technology unique identifier' })
  id: string;

  @ApiProperty({ description: 'Technology label (display name)' })
  label: string;

  @ApiProperty({ description: 'Technology value (unique identifier)' })
  value: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

export class TechnologiesListDto {
  @ApiProperty({ type: [TechnologyResponseDto] })
  data: TechnologyResponseDto[];

  @ApiProperty({ description: 'Total count of technologies' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Page size limit' })
  limit: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  next: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  prev: boolean;
}

export class TechnologyQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query for label or value' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class BulkCreateTechnologiesDto {
  @ApiProperty({
    description: 'Array of technologies to create',
    type: [CreateTechnologyDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  technologies: CreateTechnologyDto[];
}

export class TechnologiesListEnvelopeDto extends StandardResponseDto<TechnologiesListDto> {}
export class SingleTechnologyResponseDto extends StandardResponseDto<TechnologyResponseDto> {}
export class BulkCreateTechnologiesResponseDto extends StandardResponseDto<
  TechnologyResponseDto[]
> {}
