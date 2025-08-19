import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ArrayNotEmpty,
  ArrayMinSize,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StandardResponseDto } from '../auth/dto/auth.dto';

export enum ProjectStatusEnum {
  InProgress = 'inprogress',
  Completed = 'completed',
  Planning = 'planning',
}

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Short summary', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  brief: string;

  @ApiProperty({ description: 'List of technologies', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  technologies: string[];

  @ApiPropertyOptional({ description: 'GitHub repository link' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubLink?: string;

  @ApiPropertyOptional({ description: 'Demo URL' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  demoLink?: string;

  @ApiPropertyOptional({ description: 'Featured flag', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiProperty({ description: 'Public visibility flag' })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ enum: ProjectStatusEnum })
  @IsEnum(ProjectStatusEnum)
  status: ProjectStatusEnum;

  @ApiPropertyOptional({ description: 'Project start date (ISO)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Project end date (ISO)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Initial likes count', default: 0 })
  @IsOptional()
  @IsInt()
  likes?: number = 0;
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  brief?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  demoLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ enum: ProjectStatusEnum })
  @IsOptional()
  @IsEnum(ProjectStatusEnum)
  status?: ProjectStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  likes?: number;
}

export class ProjectQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by technology',
    type: String,
  })
  @IsOptional()
  @IsString()
  technology?: string;

  @ApiPropertyOptional({
    description: 'Filter by featured status',
    type: String,
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  isFeatured?: string;
}

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  coverUrl?: string | null;

  @ApiProperty()
  description: string;

  @ApiProperty()
  brief: string;

  @ApiProperty({ type: [String] })
  technologies: string[];

  @ApiPropertyOptional()
  githubLink?: string | null;

  @ApiPropertyOptional()
  demoLink?: string | null;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty({ enum: ProjectStatusEnum })
  status: ProjectStatusEnum;

  @ApiPropertyOptional()
  startDate?: string | null;

  @ApiPropertyOptional()
  endDate?: string | null;

  @ApiProperty()
  likes: number;

  @ApiPropertyOptional()
  comments?: number | null;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiPropertyOptional({ description: 'Creator avatar URL' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Creator name' })
  creatorName?: string | null;
}

export class PagedProjectsResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  data: ProjectResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class ProjectItemResponseDto extends StandardResponseDto<ProjectResponseDto> {}
export class ProjectsListResponseDto extends StandardResponseDto<PagedProjectsResponseDto> {}

export class SingleProjectResponseDto extends StandardResponseDto<ProjectResponseDto> {}

export class ProjectsListDataDto {
  @ApiProperty({ type: [ProjectResponseDto], name: 'projects' })
  projects: ProjectResponseDto[];

  @ApiProperty()
  limit: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  next: boolean;

  @ApiProperty()
  prev: boolean;
}

export class ProjectsListEnvelopeDto extends StandardResponseDto<ProjectsListDataDto> {}
