import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/types/auth.types';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectDto,
  ProjectWithTechnologiesDto,
  ProjectListResponseDto,
  StandardResponseDto,
  LikeProjectDto,
  DislikeProjectDto,
  ProjectLikeResponseDto,
  ProjectLikesStatsDto,
} from './dto/projects.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Project',
    description: 'Create a new project',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectDto' },
        message: { type: 'string', example: 'Project created successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createProject(
    @Body() createDto: CreateProjectDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<ProjectDto>> {
    return this.projectsService.createProject(createDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get Projects',
    description: 'Get a paginated list of projects with optional filtering',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'is_public',
    required: false,
    description: 'Filter by public status',
  })
  @ApiQuery({
    name: 'is_featured',
    required: false,
    description: 'Filter by featured status',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectListResponseDto' },
        message: { type: 'string', example: 'Projects retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getProjects(
    @Query() query: ProjectQueryDto,
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    return this.projectsService.getProjects(query);
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get Public Projects',
    description: 'Get all public projects',
  })
  @ApiResponse({
    status: 200,
    description: 'Public projects retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectListResponseDto' },
        message: {
          type: 'string',
          example: 'Public projects retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getPublicProjects(
    @Query() query: ProjectQueryDto,
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    return this.projectsService.getPublicProjects(query);
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Get Featured Projects',
    description: 'Get all featured projects',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured projects retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProjectDto' },
        },
        message: {
          type: 'string',
          example: 'Featured projects retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getFeaturedProjects(): Promise<StandardResponseDto<ProjectDto[]>> {
    return this.projectsService.getFeaturedProjects();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search Projects',
    description: 'Search projects by title or description',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectListResponseDto' },
        message: {
          type: 'string',
          example: 'Search results retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async searchProjects(
    @Query('q') searchTerm: string,
    @Query() query: ProjectQueryDto,
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    return this.projectsService.searchProjects(searchTerm, query);
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'Get Projects by Status',
    description: 'Get projects filtered by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectListResponseDto' },
        message: { type: 'string', example: 'Projects retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getProjectsByStatus(
    @Param('status') status: string,
    @Query() query: ProjectQueryDto,
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    return this.projectsService.getProjectsByStatus(status, query);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get My Projects',
    description: 'Get current user projects',
  })
  @ApiResponse({
    status: 200,
    description: 'User projects retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectListResponseDto' },
        message: {
          type: 'string',
          example: 'User projects retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMyProjects(
    @Query() query: ProjectQueryDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    return this.projectsService.getUserProjects(user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Project by ID',
    description: 'Get a specific project by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectDto' },
        message: { type: 'string', example: 'Project retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectById(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<ProjectDto>> {
    return this.projectsService.getProjectById(id);
  }

  @Get(':id/with-technologies')
  @ApiOperation({
    summary: 'Get Project with Technologies',
    description: 'Get a project with detailed technology information',
  })
  @ApiResponse({
    status: 200,
    description: 'Project with technologies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectWithTechnologiesDto' },
        message: {
          type: 'string',
          example: 'Project with technologies retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectWithTechnologies(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<ProjectWithTechnologiesDto>> {
    return this.projectsService.getProjectWithTechnologies(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Project',
    description: 'Update a project (owner or admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectDto' },
        message: { type: 'string', example: 'Project updated successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own projects',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async updateProject(
    @Param('id') id: string,
    @Body() updateDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<ProjectDto>> {
    return this.projectsService.updateProject(id, updateDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Project',
    description: 'Delete a project (owner or admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Project deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own projects',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async deleteProject(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<null>> {
    return this.projectsService.deleteProject(id, user.id);
  }

  // =====================================================
  // LIKE/DISLIKE ENDPOINTS
  // =====================================================

  @Post('like')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Like Project',
    description: 'Like a project (requires authentication)',
  })
  @ApiResponse({
    status: 201,
    description: 'Project liked successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectLikeResponseDto' },
        message: { type: 'string', example: 'Project liked successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or project not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @HttpCode(HttpStatus.CREATED)
  async likeProject(
    @Body() likeDto: LikeProjectDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<ProjectLikeResponseDto>> {
    return this.projectsService.likeProject(likeDto.project_id, user.id);
  }

  @Post('dislike')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dislike Project',
    description: 'Dislike a project (requires authentication)',
  })
  @ApiResponse({
    status: 201,
    description: 'Project disliked successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectLikeResponseDto' },
        message: { type: 'string', example: 'Project disliked successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or project not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @HttpCode(HttpStatus.CREATED)
  async dislikeProject(
    @Body() dislikeDto: DislikeProjectDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<ProjectLikeResponseDto>> {
    return this.projectsService.dislikeProject(dislikeDto.project_id, user.id);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove Like/Dislike',
    description:
      'Remove user like or dislike from a project (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Like/dislike removed successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: {
          type: 'string',
          example: 'Like/dislike removed successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'No like or dislike found for this project',
  })
  async removeProjectLike(
    @Param('id') projectId: string,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<null>> {
    return this.projectsService.removeProjectLike(projectId, user.id);
  }

  @Get(':id/likes')
  @ApiOperation({
    summary: 'Get Project Likes Stats',
    description: 'Get likes and dislikes statistics for a project',
  })
  @ApiResponse({
    status: 200,
    description: 'Project likes stats retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ProjectLikesStatsDto' },
        message: {
          type: 'string',
          example: 'Project likes stats retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectLikesStats(
    @Param('id') projectId: string,
    @CurrentUser() user?: User,
  ): Promise<StandardResponseDto<ProjectLikesStatsDto>> {
    return this.projectsService.getProjectLikesStats(projectId, user?.id);
  }
}
