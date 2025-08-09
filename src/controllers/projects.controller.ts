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
  Req,
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
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { UserProfile } from '../types/auth.types';
import { ProjectsService } from '../services/projects.service';
import { SupabaseService } from '../services/supabase.service';
import type { Request } from 'express';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectResponseDto,
  ProjectsListEnvelopeDto,
} from '../dto/projects.dto';

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

  @Get()
  @ApiOperation({
    summary: 'List projects with pagination, search, and filtering',
  })
  @ApiOkResponse({ description: 'Projects list' })
  async list(
    @Query() query: ProjectQueryDto,
    @Req() req: Request,
  ): Promise<ProjectsListEnvelopeDto> {
    const userFromToken = await this.getOptionalUserFromAuthHeader(req);
    const result = await this.projectsService.findAll(
      query,
      userFromToken ?? undefined,
    );
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
      message: 'Projects fetched successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiOkResponse({ description: 'Project details' })
  async getById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ data: ProjectResponseDto; status: string; message: string }> {
    const userFromToken = await this.getOptionalUserFromAuthHeader(req);
    const project = await this.projectsService.findOne(
      id,
      userFromToken ?? undefined,
    );
    return {
      data: project,
      status: 'success',
      message: 'Project fetched successfully',
    };
  }

  private async getOptionalUserFromAuthHeader(
    req: Request,
  ): Promise<UserProfile | null> {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      const user = await this.supabaseService.verifySession(token);
      return user;
    }
    return null;
  }
}
