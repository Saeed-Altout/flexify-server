import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNumber,
  IsIn,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProjectStatus } from '../enums';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  technologies?: string[];

  @IsOptional()
  @IsString()
  @IsUrl()
  cover_url?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  demo_url?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  github_url?: string;

  @IsOptional()
  @IsNumber()
  likes_count?: number;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  technologies?: string[];

  @IsOptional()
  @IsString()
  @IsUrl()
  cover_url?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  demo_url?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  github_url?: string;

  @IsOptional()
  @IsNumber()
  likes_count?: number;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}

export class ProjectQueryDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsNumber()
  likes_count?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsUUID('4')
  user_id?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(['title', 'status', 'likes_count', 'created_at', 'updated_at'])
  sort_by?: 'title' | 'status' | 'likes_count' | 'created_at' | 'updated_at';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}

export class LikeProjectDto {
  @IsUUID('4')
  @IsNotEmpty()
  project_id: string;
}
