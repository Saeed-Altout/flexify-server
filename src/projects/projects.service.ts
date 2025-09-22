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

@Injectable()
export class ProjectsService {
  constructor(
    private supabaseService: SupabaseService,
    private fileUploadService: FileUploadService,
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
  ): Promise<RootResponse<{ url: string; path: string; filename: string }>> {
    try {
      // Verify project exists and user owns it
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
        throw new ForbiddenException('You can only update your own projects');
      }

      // Upload the cover image
      const uploadResult = await this.fileUploadService.uploadProjectImage(
        {
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        },
        userId,
        projectId,
      );

      // Update project with new cover URL
      const { error: updateError } = await this.supabaseService.update(
        'projects',
        { cover: uploadResult.url },
        { id: projectId },
      );

      if (updateError) {
        throw new BadRequestException(
          `Failed to update project cover: ${updateError.message}`,
        );
      }

      return {
        data: uploadResult,
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
  ): Promise<RootResponse<{ url: string; path: string; filename: string }>> {
    try {
      // Verify project exists and user owns it
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
        throw new ForbiddenException('You can only update your own projects');
      }

      // Check if project already has maximum number of images (10)
      const currentImages = project[0].images || [];
      if (currentImages.length >= 10) {
        throw new BadRequestException(
          'Maximum number of images (10) reached for this project',
        );
      }

      // Upload the project image
      const uploadResult = await this.fileUploadService.uploadProjectImage(
        {
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        },
        userId,
        projectId,
      );

      // Add new image URL to project images array
      const updatedImages = [...currentImages, uploadResult.url];

      const { error: updateError } = await this.supabaseService.update(
        'projects',
        { images: updatedImages },
        { id: projectId },
      );

      if (updateError) {
        throw new BadRequestException(
          `Failed to update project images: ${updateError.message}`,
        );
      }

      return {
        data: uploadResult,
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
  ): Promise<RootResponse<null>> {
    try {
      // Verify project exists and user owns it
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
        throw new ForbiddenException('You can only update your own projects');
      }

      // Remove image URL from project images array
      const currentImages = project[0].images || [];
      const updatedImages = currentImages.filter(
        (img: string) => img !== imageUrl,
      );

      if (currentImages.length === updatedImages.length) {
        throw new NotFoundException('Image not found in project');
      }

      const { error: updateError } = await this.supabaseService.update(
        'projects',
        { images: updatedImages },
        { id: projectId },
      );

      if (updateError) {
        throw new BadRequestException(
          `Failed to remove project image: ${updateError.message}`,
        );
      }

      return {
        data: null,
        message: 'Project image deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
