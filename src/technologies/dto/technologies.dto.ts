import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TechnologyCategory } from '../enums/technologies.enums';

export class CreateTechnologyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(150)
  description?: string;

  @IsEnum(TechnologyCategory)
  @IsNotEmpty()
  category: TechnologyCategory;

  @IsOptional()
  @IsString()
  icon_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTechnologyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(TechnologyCategory)
  category?: TechnologyCategory;

  @IsOptional()
  @IsString()
  icon_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class TechnologyQueryDto {
  @IsString()
  @IsOptional()
  category?: TechnologyCategory;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}
