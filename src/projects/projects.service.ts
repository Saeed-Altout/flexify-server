import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import {
  LikeProjectResponse,
  Project,
  ProjectsResponse,
  ProjectCoverUploadResponse,
  ProjectImageUploadResponse,
  ProjectImage,
  ProjectCover,
} from './types/projects.types';
import {
  CreateProjectDto,
  ProjectQueryDto,
  UpdateProjectDto,
} from './dto/projects.dto';
import { RootResponse } from 'src/common/types';
import { ProjectStatus } from './enums';

import { SupabaseService } from '../supabase/supabase.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { ProjectImageService } from './services/project-image.service';

@Injectable()
export class ProjectsService {
  constructor(
    private supabaseService: SupabaseService,
    private fileUploadService: FileUploadService,
    private projectImageService: ProjectImageService,
  ) {}

  async createProject(
    createDto: CreateProjectDto,
    userId: string,
  ): Promise<RootResponse<Project>> {
    try {
      const { data, error } = await this.supabaseService.insert('projects', {
        title: createDto.title,
        description: createDto.description,
        content: createDto.content,
        status: createDto.status || ProjectStatus.Planning,
        user_id: userId,
        likes_count: createDto.likes_count || 0,
        technologies: createDto.technologies || [],
        cover: createDto.cover,
        images: createDto.images || [],
        demo_url: createDto.demo_url,
        github_url: createDto.github_url,
        is_public: createDto.is_public || false,
        is_featured: createDto.is_featured || false,
      });

      if (error) {
        throw new BadRequestException(
          `Failed to create project: ${error.message}`,
        );
      }

      return {
        data,
        message: 'Project created successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjects(
    query: ProjectQueryDto = {},
  ): Promise<RootResponse<ProjectsResponse>> {
    try {
      let supabaseQuery = this.supabaseService.supabase
        .from('projects')
        .select('*', { count: 'exact' });

      if (query.status) {
        supabaseQuery = supabaseQuery.eq('status', query.status);
      }

      if (query.is_public !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_public', query.is_public);
      }

      if (query.is_featured !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_featured', query.is_featured);
      }

      if (query.user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', query.user_id);
      }

      if (query.search) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query.search}%,description.ilike.%${query.search}%,content.ilike.%${query.search}%`,
        );
      }

      const sortBy = query.sort_by || 'created_at';
      const sortOrder = query.sort_order || 'desc';
      supabaseQuery = supabaseQuery.order(sortBy, {
        ascending: sortOrder === 'asc',
      });

      const page = query.page || 1;
      const limit = query.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      supabaseQuery = supabaseQuery.range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        throw new BadRequestException(
          `Failed to fetch projects: ${error.message}`,
        );
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const result: ProjectsResponse = {
        projects: data || [],
        total,
        page,
        limit,
        total_pages: totalPages,
      };

      return {
        data: result,
        message: 'Projects retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjectById(id: string): Promise<RootResponse<Project>> {
    try {
      const { data, error } = await this.supabaseService.select('projects', {
        eq: { id },
      });

      if (error) {
        throw new BadRequestException(
          `Failed to fetch project: ${error.message}`,
        );
      }

      if (!data || data.length === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return {
        data: data[0],
        message: 'Project retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateProject(
    id: string,
    updateDto: UpdateProjectDto,
    userId: string,
  ): Promise<RootResponse<Project>> {
    try {
      const { data: existingProject, error: fetchError } =
        await this.supabaseService.select('projects', {
          eq: { id },
        });

      if (fetchError) {
        throw new BadRequestException(
          `Failed to fetch project: ${fetchError.message}`,
        );
      }

      if (!existingProject || existingProject.length === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      if (existingProject[0].user_id !== userId) {
        throw new ForbiddenException('You can only update your own projects');
      }

      const { data, error } = await this.supabaseService.update(
        'projects',
        {
          ...updateDto,
          likes_count: updateDto.likes_count || 0,
        },
        { id },
      );

      if (error) {
        throw new BadRequestException(
          `Failed to update project: ${error.message}`,
        );
      }

      return {
        data,
        message: 'Project updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteProject(id: string, userId: string): Promise<RootResponse<null>> {
    try {
      const { data: existingProject, error: fetchError } =
        await this.supabaseService.select('projects', {
          eq: { id },
        });

      if (fetchError) {
        throw new BadRequestException(
          `Failed to fetch project: ${fetchError.message}`,
        );
      }

      if (!existingProject || existingProject.length === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      if (existingProject[0].user_id !== userId) {
        throw new ForbiddenException('You can only delete your own projects');
      }

      const { error } = await this.supabaseService.delete('projects', { id });

      if (error) {
        throw new BadRequestException(
          `Failed to delete project: ${error.message}`,
        );
      }

      return {
        data: null,
        message: 'Project deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async likeProject(
    projectId: string,
    userId: string,
  ): Promise<RootResponse<LikeProjectResponse>> {
    try {
      const { data: project, error: projectError } =
        await this.supabaseService.select('projects', {
          eq: { id: projectId },
        });

      if (projectError) {
        throw new BadRequestException(
          `Failed to fetch project: ${projectError.message}`,
        );
      }

      if (!project || project.length === 0) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      const { data: existingLike, error: likeError } =
        await this.supabaseService.select('project_likes', {
          eq: { project_id: projectId, user_id: userId },
        });

      if (likeError) {
        throw new BadRequestException(
          `Failed to check existing like: ${likeError.message}`,
        );
      }

      if (existingLike && existingLike.length > 0) {
        const { error: deleteError } = await this.supabaseService.delete(
          'project_likes',
          {
            id: existingLike[0].id,
          },
        );

        if (deleteError) {
          throw new BadRequestException(
            `Failed to delete like: ${deleteError.message}`,
          );
        }

        // Update likes_count in projects table
        const { error: updateError } = await this.supabaseService.update(
          'projects',
          {
            likes_count: Math.max(0, (project[0].likes_count || 0) - 1),
          },
          { id: projectId },
        );

        if (updateError) {
          throw new BadRequestException(
            `Failed to update likes count: ${updateError.message}`,
          );
        }

        return {
          data: {
            id: existingLike[0].id,
            project_id: projectId,
            user_id: userId,
            is_like: false,
            created_at: existingLike[0].created_at,
            updated_at: existingLike[0].updated_at,
          },
          message: 'Like/dislike removed successfully',
          status: 'success',
        };
      } else {
        const { data: newLike, error: createError } =
          await this.supabaseService.insert('project_likes', {
            project_id: projectId,
            user_id: userId,
            is_like: true,
          });

        if (createError) {
          throw new BadRequestException(
            `Failed to create like: ${createError.message}`,
          );
        }

        // Update likes_count in projects table
        const { error: updateError } = await this.supabaseService.update(
          'projects',
          {
            likes_count: (project[0].likes_count || 0) + 1,
          },
          { id: projectId },
        );

        if (updateError) {
          throw new BadRequestException(
            `Failed to update likes count: ${updateError.message}`,
          );
        }

        return {
          data: newLike,
          message: 'Project liked successfully',
          status: 'success',
        };
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async uploadProjectCover(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<RootResponse<ProjectCoverUploadResponse>> {
    try {
      const result = await this.projectImageService.uploadProjectCover(
        projectId,
        file,
        userId,
      );

      return {
        data: result,
        message: 'Project cover uploaded successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async uploadProjectImage(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<RootResponse<ProjectImageUploadResponse>> {
    try {
      const result = await this.projectImageService.uploadProjectImage(
        projectId,
        file,
        userId,
      );

      return {
        data: result,
        message: 'Project image uploaded successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteProjectImage(
    projectId: string,
    imageUrl: string,
    userId: string,
  ): Promise<RootResponse<{ deleted_url: string; remaining_images: number }>> {
    try {
      const result = await this.projectImageService.deleteProjectImage(
        projectId,
        imageUrl,
        userId,
      );

      return {
        data: result,
        message: 'Project image deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjectImages(
    projectId: string,
  ): Promise<RootResponse<ProjectImage[]>> {
    try {
      const images = await this.projectImageService.getProjectImages(projectId);

      return {
        data: images,
        message: 'Project images retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjectCover(
    projectId: string,
  ): Promise<RootResponse<ProjectCover | null>> {
    try {
      const cover = await this.projectImageService.getProjectCover(projectId);

      return {
        data: cover,
        message: cover
          ? 'Project cover retrieved successfully'
          : 'No cover found for this project',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteProjectCover(
    projectId: string,
    userId: string,
  ): Promise<RootResponse<{ deleted_cover: string }>> {
    try {
      // Verify project ownership
      const { data: project, error: projectError } =
        await this.supabaseService.select('projects', {
          eq: { id: projectId },
        });

      if (projectError) {
        throw new BadRequestException(
          `Failed to fetch project: ${projectError.message}`,
        );
      }

      if (!project || project.length === 0) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      if (project[0].user_id !== userId) {
        throw new ForbiddenException('You can only manage your own projects');
      }

      const currentCover = project[0].cover;

      if (!currentCover) {
        throw new NotFoundException('No cover found for this project');
      }

      // Remove cover from project
      const { error: updateError } = await this.supabaseService.update(
        'projects',
        { cover: null },
        { id: projectId },
      );

      if (updateError) {
        throw new BadRequestException(
          `Failed to remove project cover: ${updateError.message}`,
        );
      }

      return {
        data: { deleted_cover: currentCover },
        message: 'Project cover deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async clearAllProjectImages(
    projectId: string,
    userId: string,
  ): Promise<RootResponse<{ cleared_count: number }>> {
    try {
      const result = await this.projectImageService.clearAllProjectImages(
        projectId,
        userId,
      );

      return {
        data: result,
        message: `${result.cleared_count} images cleared successfully`,
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
