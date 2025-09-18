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
import { StandardResponseDto } from '../../auth/dto/auth.dto';

/**
 * Enum for project status values.
 */
export enum ProjectStatusEnum {
  Active = 'active',
  InProgress = 'in_progress',
  Completed = 'completed',
  Planning = 'planning',
}

/**
 * DTO for creating a new project.
 */
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  brief: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  technologies: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubLink?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  demoLink?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsBoolean()
  isPublic: boolean;

  @IsEnum(ProjectStatusEnum)
  status: ProjectStatusEnum;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  likes?: number = 0;
}

/**
 * DTO for updating an existing project.
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  brief?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubLink?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  demoLink?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(ProjectStatusEnum)
  status?: ProjectStatusEnum;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  likes?: number;
}

/**
 * DTO for querying projects with filters and pagination.
 */
export class ProjectQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  technology?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  isFeatured?: string;
}

/**
 * DTO for returning a single project's data.
 */
export class ProjectResponseDto {
  id: string;
  name: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  description: string;
  brief: string;
  technologies: string[];
  githubLink?: string | null;
  demoLink?: string | null;
  isFeatured: boolean;
  isPublic: boolean;
  status: ProjectStatusEnum;
  startDate?: string | null;
  endDate?: string | null;
  likes: number;
  comments?: number | null;
  created_at: string;
  updated_at: string;
  avatarUrl?: string | null;
  creatorName?: string | null;
}

/**
 * DTO for paginated project responses.
 */
export class PagedProjectsResponseDto {
  data: ProjectResponseDto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * DTO for a single project item response.
 */
export class ProjectItemResponseDto extends StandardResponseDto<ProjectResponseDto> {}

/**
 * DTO for a paginated list of projects.
 */
export class ProjectsListResponseDto extends StandardResponseDto<PagedProjectsResponseDto> {}

/**
 * DTO for a single project response.
 */
export class SingleProjectResponseDto extends StandardResponseDto<ProjectResponseDto> {}

/**
 * DTO for projects list data with pagination info.
 */
export class ProjectsListDataDto {
  projects: ProjectResponseDto[];
  limit: number;
  page: number;
  total: number;
  next: boolean;
  prev: boolean;
}

/**
 * Envelope DTO for projects list data.
 */
export class ProjectsListEnvelopeDto extends StandardResponseDto<ProjectsListDataDto> {}
