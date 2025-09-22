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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/types/auth.types';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  LikeProjectDto,
  DeleteProjectImageDto,
} from './dto/projects.dto';
import { RootResponse } from 'src/common/types';
import type {
  LikeProjectResponse,
  Project,
  ProjectsResponse,
} from './types/projects.types';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createProject(
    @Body() createDto: CreateProjectDto,
    @CurrentUser() user: User,
  ): Promise<RootResponse<Project>> {
    return this.projectsService.createProject(createDto, user.id);
  }

  @Get()
  async getProjects(
    @Query() query: ProjectQueryDto,
  ): Promise<RootResponse<ProjectsResponse>> {
    return this.projectsService.getProjects(query);
  }

  @Get(':id')
  async getProjectById(
    @Param('id') id: string,
  ): Promise<RootResponse<Project>> {
    return this.projectsService.getProjectById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateProject(
    @Param('id') id: string,
    @Body() updateDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ): Promise<RootResponse<Project>> {
    return this.projectsService.updateProject(id, updateDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteProject(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<RootResponse<null>> {
    return this.projectsService.deleteProject(id, user.id);
  }

  @Post('like')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async likeProject(
    @Body() likeDto: LikeProjectDto,
    @CurrentUser() user: User,
  ): Promise<RootResponse<LikeProjectResponse>> {
    return this.projectsService.likeProject(likeDto.project_id, user.id);
  }

  @Post(':id/cover')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadProjectCover(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<RootResponse<{ url: string; path: string; filename: string }>> {
    return this.projectsService.uploadProjectCover(id, file, user.id);
  }

  @Post(':id/images')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadProjectImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<RootResponse<{ url: string; path: string; filename: string }>> {
    return this.projectsService.uploadProjectImage(id, file, user.id);
  }

  @Delete(':id/images')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProjectImage(
    @Param('id') id: string,
    @Body() deleteDto: DeleteProjectImageDto,
    @CurrentUser() user: User,
  ): Promise<RootResponse<null>> {
    return this.projectsService.deleteProjectImage(
      id,
      deleteDto.image_url,
      user.id,
    );
  }
}
