import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { StandardResponseDto } from '../../auth/dto/auth.dto';

export class CreateTechnologyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  value: string;
}

export class UpdateTechnologyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  value?: string;
}

export class TechnologyResponseDto {
  id: string;

  label: string;

  value: string;

  created_at: string;

  updated_at: string;
}

export class TechnologiesListDto {
  data: TechnologyResponseDto[];

  total: number;

  page: number;

  limit: number;

  next: boolean;

  prev: boolean;
}

export class TechnologyQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  q?: string;
}

export class BulkCreateTechnologiesDto {
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
