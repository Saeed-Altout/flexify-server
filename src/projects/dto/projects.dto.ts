import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProjectStatusEnum {
  Active = 'active',
  InProgress = 'in_progress',
  Completed = 'completed',
  Planning = 'planning',
}

export class CreateProjectDto {
  @ApiProperty({ example: 'My Awesome Project', description: 'Project title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'A brief description of the project',
    description: 'Project description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Detailed project content and information',
    description: 'Project content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'active',
    enum: ProjectStatusEnum,
    description: 'Project status',
  })
  @IsOptional()
  @IsEnum(ProjectStatusEnum)
  status?: ProjectStatusEnum;

  @ApiPropertyOptional({
    example: ['tech-id-1', 'tech-id-2'],
    description: 'Array of technology IDs',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  technologies?: string[];

  @ApiPropertyOptional({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Array of image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    example: 'https://demo.example.com',
    description: 'Demo URL',
  })
  @IsOptional()
  @IsString()
  demo_url?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/user/repo',
    description: 'GitHub repository URL',
  })
  @IsOptional()
  @IsString()
  github_url?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is project public',
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Is project featured',
  })
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Updated Project Title',
    description: 'Project title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated project description',
    description: 'Project description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Updated project content',
    description: 'Project content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'completed',
    enum: ProjectStatusEnum,
    description: 'Project status',
  })
  @IsOptional()
  @IsEnum(ProjectStatusEnum)
  status?: ProjectStatusEnum;

  @ApiPropertyOptional({
    example: ['tech-id-1', 'tech-id-2'],
    description: 'Array of technology IDs',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  technologies?: string[];

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg'],
    description: 'Array of image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    example: 'https://updated-demo.example.com',
    description: 'Demo URL',
  })
  @IsOptional()
  @IsString()
  demo_url?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/user/updated-repo',
    description: 'GitHub repository URL',
  })
  @IsOptional()
  @IsString()
  github_url?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Is project public',
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Is project featured',
  })
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}

export class ProjectQueryDto {
  @ApiPropertyOptional({
    example: 'active',
    enum: ProjectStatusEnum,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(ProjectStatusEnum)
  status?: ProjectStatusEnum;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by public status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by featured status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({
    example: 'user-id-here',
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsUUID('4')
  user_id?: string;

  @ApiPropertyOptional({
    example: 'awesome project',
    description: 'Search term',
  })
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
    example: 'created_at',
    enum: ['title', 'status', 'created_at', 'updated_at'],
    description: 'Sort by field',
  })
  @IsOptional()
  @IsString()
  @IsIn(['title', 'status', 'created_at', 'updated_at'])
  sort_by?: 'title' | 'status' | 'created_at' | 'updated_at';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}

export class ProjectDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Project ID',
  })
  id: string;

  @ApiProperty({ example: 'My Awesome Project', description: 'Project title' })
  title: string;

  @ApiPropertyOptional({
    example: 'A brief description of the project',
    description: 'Project description',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'Detailed project content',
    description: 'Project content',
  })
  content?: string;

  @ApiProperty({
    example: 'active',
    enum: ProjectStatusEnum,
    description: 'Project status',
  })
  status: ProjectStatusEnum;

  @ApiProperty({
    example: 'user-id-here',
    description: 'User ID who created the project',
  })
  user_id: string;

  @ApiProperty({
    example: ['tech-id-1', 'tech-id-2'],
    description: 'Array of technology IDs',
  })
  technologies: string[];

  @ApiProperty({
    example: ['https://example.com/image1.jpg'],
    description: 'Array of image URLs',
  })
  images: string[];

  @ApiPropertyOptional({
    example: 'https://demo.example.com',
    description: 'Demo URL',
  })
  demo_url?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/user/repo',
    description: 'GitHub repository URL',
  })
  github_url?: string;

  @ApiProperty({ example: true, description: 'Is project public' })
  is_public: boolean;

  @ApiProperty({ example: false, description: 'Is project featured' })
  is_featured: boolean;

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

export class ProjectWithTechnologiesDto extends ProjectDto {
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        category: { type: 'string' },
        icon_url: { type: 'string' },
      },
    },
    description: 'Technology details',
  })
  technology_details?: Array<{
    id: string;
    name: string;
    category?: string;
    icon_url?: string;
  }>;
}

export class ProjectListResponseDto {
  @ApiProperty({ type: [ProjectDto], description: 'List of projects' })
  projects: ProjectDto[];

  @ApiProperty({ example: 50, description: 'Total number of projects' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  total_pages: number;
}

// Like/Dislike DTOs
export class LikeProjectDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Project ID to like',
  })
  @IsUUID('4')
  project_id: string;
}

export class DislikeProjectDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Project ID to dislike',
  })
  @IsUUID('4')
  project_id: string;
}

export class ProjectLikeResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Like ID',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Project ID',
  })
  project_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID who liked/disliked',
  })
  user_id: string;

  @ApiProperty({
    example: true,
    description: 'True for like, false for dislike',
  })
  is_like: boolean;

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

export class ProjectLikesStatsDto {
  @ApiProperty({
    example: 42,
    description: 'Total number of likes',
  })
  likes_count: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of dislikes',
  })
  dislikes_count: number;

  @ApiProperty({
    example: true,
    description: 'Whether current user has liked this project',
  })
  user_liked?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether current user has disliked this project',
  })
  user_disliked?: boolean;
}

export class StandardResponseDto<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: 'Success message', description: 'Response message' })
  message: string;

  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;
}
