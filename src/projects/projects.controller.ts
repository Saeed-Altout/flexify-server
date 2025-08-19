import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserProfile } from '../auth/types/auth.types';
import { ProjectsService } from './projects.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectResponseDto,
  ProjectsListEnvelopeDto,
  SingleProjectResponseDto,
} from './dto/projects.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new project' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiCreatedResponse({ description: 'Project created' })
  create(
    @CurrentUser() user: UserProfile,
    @Body() body: CreateProjectDto,
    @UploadedFiles()
    files?: { logo?: any[]; cover?: any[] },
  ): Promise<{ data: ProjectResponseDto; status: string; message: string }> {
    // Only admins can mutate; enforced via user.role
    // Extract logo and cover from files[] by fieldname if provided
    const logo = files?.logo?.[0];
    const cover = files?.cover?.[0];
    const payloadFiles = {
      logo: logo ? { buffer: logo.buffer, mimetype: logo.mimetype } : undefined,
      cover: cover
        ? { buffer: cover.buffer, mimetype: cover.mimetype }
        : undefined,
    };
    return this.projectsService
      .create(user, body, payloadFiles)
      .then((project) => ({
        data: project,
        status: 'success',
        message: 'Project created successfully',
      }));
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing project' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiOkResponse({ description: 'Project updated' })
  update(
    @CurrentUser() user: UserProfile,
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @UploadedFiles()
    files?: { logo?: any[]; cover?: any[] },
  ): Promise<{ data: ProjectResponseDto; status: string; message: string }> {
    const logo = files?.logo?.[0];
    const cover = files?.cover?.[0];
    const payloadFiles = {
      logo: logo ? { buffer: logo.buffer, mimetype: logo.mimetype } : undefined,
      cover: cover
        ? { buffer: cover.buffer, mimetype: cover.mimetype }
        : undefined,
    };
    return this.projectsService
      .update(user, id, body, payloadFiles)
      .then((project) => ({
        data: project,
        status: 'success',
        message: 'Project updated successfully',
      }));
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a project' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: UserProfile,
    @Param('id') id: string,
  ): Promise<void> {
    await this.projectsService.delete(user, id);
  }

  @Get('technologies')
  @ApiOperation({ summary: 'Get all unique technologies from all projects' })
  @ApiOkResponse({
    description: 'List of all technologies used in projects',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'string' },
        },
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async getTechnologies(): Promise<{
    data: string[];
    status: string;
    message: string;
  }> {
    const technologies = await this.projectsService.getAllTechnologies();
    return {
      data: technologies,
      status: 'success',
      message: 'Technologies retrieved successfully',
    };
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all projects (public access for guests)' })
  @ApiOkResponse({
    description: 'List of all projects accessible to guests',
    type: ProjectsListEnvelopeDto,
  })
  async getPublicProjects(
    @Query() query: ProjectQueryDto,
  ): Promise<ProjectsListEnvelopeDto> {
    const result = await this.projectsService.findAll(query);

    return {
      data: {
        projects: result.data,
        limit: Number(query.limit ?? 10),
        page: Number(query.page ?? 1),
        total: result.total,
        next:
          result.total > Number(query.page ?? 1) * Number(query.limit ?? 10),
        prev: Number(query.page ?? 1) > 1,
      },
      status: 'success',
      message: 'Projects retrieved successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  @ApiOkResponse({
    description: 'Projects list',
    type: ProjectsListEnvelopeDto,
  })
  async list(
    @Query() query: ProjectQueryDto,
  ): Promise<ProjectsListEnvelopeDto> {
    const result = await this.projectsService.findAll(query);

    return {
      data: {
        projects: result.data,
        limit: Number(query.limit ?? 10),
        page: Number(query.page ?? 1),
        total: result.total,
        next:
          result.total > Number(query.page ?? 1) * Number(query.limit ?? 10),
        prev: Number(query.page ?? 1) > 1,
      },
      status: 'success',
      message: 'Projects retrieved successfully',
    };
  }

  @Get('admin/all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all projects for admin (including private)' })
  @ApiOkResponse({
    description: 'All projects list',
    type: ProjectsListEnvelopeDto,
  })
  async listAllForAdmin(
    @Query() query: ProjectQueryDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ProjectsListEnvelopeDto> {
    // Ensure user is admin
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }

    const result = await this.projectsService.findAllForAdmin(query);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const total = result.total;
    const totalPages = Math.ceil(total / (limit || 1)) || 1;
    const next = page < totalPages;
    const prev = page > 1;
    return {
      data: {
        projects: result.data,
        limit,
        page,
        total,
        next,
        prev,
      },
      status: 'success',
      message: 'All projects fetched successfully (admin view)',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiOkResponse({
    description: 'Project details',
    type: SingleProjectResponseDto,
  })
  async getOne(@Param('id') id: string): Promise<SingleProjectResponseDto> {
    const project = await this.projectsService.findOne(id);
    return {
      data: project,
      message: 'Project retrieved successfully',
      status: 'success',
    };
  }
}
