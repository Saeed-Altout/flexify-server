import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectQuery,
  ProjectListResponse,
  ProjectWithTechnologies,
  ProjectLike,
  ProjectLikesStats,
  LikeProjectRequest,
  DislikeProjectRequest,
} from './types/projects.types';
import {
  StandardResponseDto,
  ProjectListResponseDto,
  ProjectWithTechnologiesDto,
  ProjectDto,
  ProjectStatusEnum,
  ProjectLikeResponseDto,
  ProjectLikesStatsDto,
} from './dto/projects.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private supabaseService: SupabaseService) {}

  // =====================================================
  // CONVERSION FUNCTIONS
  // =====================================================

  private convertProjectToDto(project: Project): ProjectDto {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      content: project.content,
      status: project.status as ProjectStatusEnum,
      user_id: project.user_id,
      technologies: project.technologies,
      images: project.images,
      demo_url: project.demo_url,
      github_url: project.github_url,
      is_public: project.is_public,
      is_featured: project.is_featured,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };
  }

  private convertProjectWithTechnologiesToDto(
    projectWithTech: ProjectWithTechnologies,
  ): ProjectWithTechnologiesDto {
    return {
      ...this.convertProjectToDto(projectWithTech),
      technology_details: projectWithTech.technology_details,
    };
  }

  private convertProjectListResponseToDto(
    response: ProjectListResponse,
  ): ProjectListResponseDto {
    return {
      projects: response.projects.map((project) =>
        this.convertProjectToDto(project),
      ),
      total: response.total,
      page: response.page,
      limit: response.limit,
      total_pages: response.total_pages,
    };
  }

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  async createProject(
    createDto: CreateProjectRequest,
    userId: string,
  ): Promise<StandardResponseDto<ProjectDto>> {
    try {
      this.logger.log(
        `Creating project: ${createDto.title} for user: ${userId}`,
      );

      const { data, error } = await this.supabaseService.insert('projects', {
        title: createDto.title,
        description: createDto.description,
        content: createDto.content,
        status: createDto.status || 'planning',
        user_id: userId,
        technologies: createDto.technologies || [],
        images: createDto.images || [],
        demo_url: createDto.demo_url,
        github_url: createDto.github_url,
        is_public: createDto.is_public || false,
        is_featured: createDto.is_featured || false,
      });

      if (error) {
        this.logger.error(`Error creating project: ${error.message}`);
        throw new BadRequestException(
          `Failed to create project: ${error.message}`,
        );
      }

      this.logger.log(`Successfully created project: ${data.id}`);

      return {
        data: this.convertProjectToDto(data),
        message: 'Project created successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in createProject: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjects(
    query: ProjectQuery = {},
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    try {
      this.logger.log('Fetching projects');

      let supabaseQuery = this.supabaseService.supabase
        .from('projects')
        .select('*', { count: 'exact' });

      // Apply filters
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

      // Apply sorting
      const sortBy = query.sort_by || 'created_at';
      const sortOrder = query.sort_order || 'desc';
      supabaseQuery = supabaseQuery.order(sortBy, {
        ascending: sortOrder === 'asc',
      });

      // Apply pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      supabaseQuery = supabaseQuery.range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        this.logger.error(`Error fetching projects: ${error.message}`);
        throw new BadRequestException(
          `Failed to fetch projects: ${error.message}`,
        );
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const response: ProjectListResponse = {
        projects: data || [],
        total,
        page,
        limit,
        total_pages: totalPages,
      };

      this.logger.log(`Successfully fetched ${data?.length || 0} projects`);

      return {
        data: this.convertProjectListResponseToDto(response),
        message: 'Projects retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getProjects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjectById(id: string): Promise<StandardResponseDto<ProjectDto>> {
    try {
      this.logger.log(`Fetching project with ID: ${id}`);

      const { data, error } = await this.supabaseService.select('projects', {
        eq: { id },
      });

      if (error) {
        this.logger.error(`Error fetching project: ${error.message}`);
        throw new BadRequestException(
          `Failed to fetch project: ${error.message}`,
        );
      }

      if (!data || data.length === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched project: ${id}`);

      return {
        data: this.convertProjectToDto(data[0]),
        message: 'Project retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getProjectById: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjectWithTechnologies(
    id: string,
  ): Promise<StandardResponseDto<ProjectWithTechnologiesDto>> {
    try {
      this.logger.log(`Fetching project with technologies for ID: ${id}`);

      // Get the project
      const { data: projectData, error: projectError } =
        await this.supabaseService.select('projects', {
          eq: { id },
        });

      if (projectError) {
        this.logger.error(`Error fetching project: ${projectError.message}`);
        throw new BadRequestException(
          `Failed to fetch project: ${projectError.message}`,
        );
      }

      if (!projectData || projectData.length === 0) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      const project = projectData[0];

      // Get technology details if technologies exist
      let technologyDetails: Array<{
        id: string;
        name: string;
        category?: string;
        icon_url?: string;
      }> = [];
      if (project.technologies && project.technologies.length > 0) {
        const { data: techData, error: techError } =
          await this.supabaseService.supabase
            .from('technologies')
            .select('id, name, category, icon_url')
            .in('id', project.technologies);

        if (techError) {
          this.logger.warn(
            `Error fetching technology details: ${techError.message}`,
          );
        } else {
          technologyDetails = techData || [];
        }
      }

      const projectWithTechnologies: ProjectWithTechnologies = {
        ...project,
        technology_details: technologyDetails,
      };

      this.logger.log(
        `Successfully fetched project with ${technologyDetails.length} technologies`,
      );

      return {
        data: this.convertProjectWithTechnologiesToDto(projectWithTechnologies),
        message: 'Project with technologies retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getProjectWithTechnologies: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateProject(
    id: string,
    updateDto: UpdateProjectRequest,
    userId: string,
  ): Promise<StandardResponseDto<ProjectDto>> {
    try {
      this.logger.log(`Updating project with ID: ${id}`);

      // Check if project exists and user owns it
      const { data: existingProject, error: fetchError } =
        await this.supabaseService.select('projects', {
          eq: { id },
        });

      if (fetchError) {
        this.logger.error(`Error fetching project: ${fetchError.message}`);
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

      // Update the project
      const { data, error } = await this.supabaseService.update(
        'projects',
        {
          ...updateDto,
        },
        { id },
      );

      if (error) {
        this.logger.error(`Error updating project: ${error.message}`);
        throw new BadRequestException(
          `Failed to update project: ${error.message}`,
        );
      }

      this.logger.log(`Successfully updated project: ${id}`);

      return {
        data: this.convertProjectToDto(data),
        message: 'Project updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateProject: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteProject(
    id: string,
    userId: string,
  ): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log(`Deleting project with ID: ${id}`);

      // Check if project exists and user owns it
      const { data: existingProject, error: fetchError } =
        await this.supabaseService.select('projects', {
          eq: { id },
        });

      if (fetchError) {
        this.logger.error(`Error fetching project: ${fetchError.message}`);
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

      // Delete the project
      const { error } = await this.supabaseService.delete('projects', { id });

      if (error) {
        this.logger.error(`Error deleting project: ${error.message}`);
        throw new BadRequestException(
          `Failed to delete project: ${error.message}`,
        );
      }

      this.logger.log(`Successfully deleted project: ${id}`);

      return {
        data: null,
        message: 'Project deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in deleteProject: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // PUBLIC PROJECTS
  // =====================================================

  async getPublicProjects(
    query: ProjectQuery = {},
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    try {
      this.logger.log('Fetching public projects');

      const publicQuery = { ...query, is_public: true };
      return this.getProjects(publicQuery);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getPublicProjects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getFeaturedProjects(): Promise<StandardResponseDto<ProjectDto[]>> {
    try {
      this.logger.log('Fetching featured projects');

      const { data, error } = await this.supabaseService.supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        this.logger.error(`Error fetching featured projects: ${error.message}`);
        throw new BadRequestException(
          `Failed to fetch featured projects: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully fetched ${data?.length || 0} featured projects`,
      );

      return {
        data: (data || []).map((project) => this.convertProjectToDto(project)),
        message: 'Featured projects retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getFeaturedProjects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // SEARCH AND FILTER
  // =====================================================

  async searchProjects(
    searchTerm: string,
    query: ProjectQuery = {},
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    try {
      this.logger.log(`Searching projects with term: ${searchTerm}`);

      const searchQuery = { ...query, search: searchTerm };
      return this.getProjects(searchQuery);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in searchProjects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjectsByStatus(
    status: string,
    query: ProjectQuery = {},
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    try {
      this.logger.log(`Fetching projects with status: ${status}`);

      const statusQuery = { ...query, status: status as any };
      return this.getProjects(statusQuery);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getProjectsByStatus: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getUserProjects(
    userId: string,
    query: ProjectQuery = {},
  ): Promise<StandardResponseDto<ProjectListResponseDto>> {
    try {
      this.logger.log(`Fetching projects for user: ${userId}`);

      const userQuery = { ...query, user_id: userId };
      return this.getProjects(userQuery);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getUserProjects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // LIKE/DISLIKE OPERATIONS
  // =====================================================

  async likeProject(
    projectId: string,
    userId: string,
  ): Promise<StandardResponseDto<ProjectLikeResponseDto>> {
    try {
      this.logger.log(`User ${userId} liking project ${projectId}`);

      // Check if project exists
      const { data: project, error: projectError } =
        await this.supabaseService.select('projects', {
          eq: { id: projectId },
        });

      if (projectError) {
        this.logger.error(`Error fetching project: ${projectError.message}`);
        throw new BadRequestException(
          `Failed to fetch project: ${projectError.message}`,
        );
      }

      if (!project || project.length === 0) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Check if user already has a like/dislike for this project
      const { data: existingLike, error: likeError } =
        await this.supabaseService.select('project_likes', {
          eq: { project_id: projectId, user_id: userId },
        });

      if (likeError) {
        this.logger.error(`Error checking existing like: ${likeError.message}`);
        throw new BadRequestException(
          `Failed to check existing like: ${likeError.message}`,
        );
      }

      if (existingLike && existingLike.length > 0) {
        // Update existing like/dislike to like
        const { data: updatedLike, error: updateError } =
          await this.supabaseService.update(
            'project_likes',
            { is_like: true, updated_at: new Date().toISOString() },
            { id: existingLike[0].id },
          );

        if (updateError) {
          this.logger.error(`Error updating like: ${updateError.message}`);
          throw new BadRequestException(
            `Failed to update like: ${updateError.message}`,
          );
        }

        this.logger.log(`Successfully updated like for project ${projectId}`);

        return {
          data: this.convertProjectLikeToDto(updatedLike),
          message: 'Project liked successfully',
          status: 'success',
        };
      } else {
        // Create new like
        const { data: newLike, error: createError } =
          await this.supabaseService.insert('project_likes', {
            project_id: projectId,
            user_id: userId,
            is_like: true,
          });

        if (createError) {
          this.logger.error(`Error creating like: ${createError.message}`);
          throw new BadRequestException(
            `Failed to create like: ${createError.message}`,
          );
        }

        this.logger.log(`Successfully created like for project ${projectId}`);

        return {
          data: this.convertProjectLikeToDto(newLike),
          message: 'Project liked successfully',
          status: 'success',
        };
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in likeProject: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async dislikeProject(
    projectId: string,
    userId: string,
  ): Promise<StandardResponseDto<ProjectLikeResponseDto>> {
    try {
      this.logger.log(`User ${userId} disliking project ${projectId}`);

      // Check if project exists
      const { data: project, error: projectError } =
        await this.supabaseService.select('projects', {
          eq: { id: projectId },
        });

      if (projectError) {
        this.logger.error(`Error fetching project: ${projectError.message}`);
        throw new BadRequestException(
          `Failed to fetch project: ${projectError.message}`,
        );
      }

      if (!project || project.length === 0) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Check if user already has a like/dislike for this project
      const { data: existingLike, error: likeError } =
        await this.supabaseService.select('project_likes', {
          eq: { project_id: projectId, user_id: userId },
        });

      if (likeError) {
        this.logger.error(`Error checking existing like: ${likeError.message}`);
        throw new BadRequestException(
          `Failed to check existing like: ${likeError.message}`,
        );
      }

      if (existingLike && existingLike.length > 0) {
        // Update existing like/dislike to dislike
        const { data: updatedLike, error: updateError } =
          await this.supabaseService.update(
            'project_likes',
            { is_like: false, updated_at: new Date().toISOString() },
            { id: existingLike[0].id },
          );

        if (updateError) {
          this.logger.error(`Error updating dislike: ${updateError.message}`);
          throw new BadRequestException(
            `Failed to update dislike: ${updateError.message}`,
          );
        }

        this.logger.log(
          `Successfully updated dislike for project ${projectId}`,
        );

        return {
          data: this.convertProjectLikeToDto(updatedLike),
          message: 'Project disliked successfully',
          status: 'success',
        };
      } else {
        // Create new dislike
        const { data: newLike, error: createError } =
          await this.supabaseService.insert('project_likes', {
            project_id: projectId,
            user_id: userId,
            is_like: false,
          });

        if (createError) {
          this.logger.error(`Error creating dislike: ${createError.message}`);
          throw new BadRequestException(
            `Failed to create dislike: ${createError.message}`,
          );
        }

        this.logger.log(
          `Successfully created dislike for project ${projectId}`,
        );

        return {
          data: this.convertProjectLikeToDto(newLike),
          message: 'Project disliked successfully',
          status: 'success',
        };
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in dislikeProject: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async removeProjectLike(
    projectId: string,
    userId: string,
  ): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log(
        `User ${userId} removing like/dislike for project ${projectId}`,
      );

      // Check if like exists
      const { data: existingLike, error: likeError } =
        await this.supabaseService.select('project_likes', {
          eq: { project_id: projectId, user_id: userId },
        });

      if (likeError) {
        this.logger.error(`Error checking existing like: ${likeError.message}`);
        throw new BadRequestException(
          `Failed to check existing like: ${likeError.message}`,
        );
      }

      if (!existingLike || existingLike.length === 0) {
        throw new NotFoundException(
          'No like or dislike found for this project',
        );
      }

      // Delete the like/dislike
      const { error: deleteError } = await this.supabaseService.delete(
        'project_likes',
        {
          id: existingLike[0].id,
        },
      );

      if (deleteError) {
        this.logger.error(`Error deleting like: ${deleteError.message}`);
        throw new BadRequestException(
          `Failed to delete like: ${deleteError.message}`,
        );
      }

      this.logger.log(
        `Successfully removed like/dislike for project ${projectId}`,
      );

      return {
        data: null,
        message: 'Like/dislike removed successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in removeProjectLike: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async toggleProjectLike(
    projectId: string,
    userId: string,
  ): Promise<StandardResponseDto<ProjectLikeResponseDto | null>> {
    try {
      this.logger.log(`User ${userId} toggling like for project ${projectId}`);

      // Check if project exists
      const { data: project, error: projectError } =
        await this.supabaseService.select('projects', {
          eq: { id: projectId },
        });

      if (projectError) {
        this.logger.error(`Error fetching project: ${projectError.message}`);
        throw new BadRequestException(
          `Failed to fetch project: ${projectError.message}`,
        );
      }

      if (!project || project.length === 0) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Check if user already has a like/dislike for this project
      const { data: existingLike, error: likeError } =
        await this.supabaseService.select('project_likes', {
          eq: { project_id: projectId, user_id: userId },
        });

      if (likeError) {
        this.logger.error(`Error checking existing like: ${likeError.message}`);
        throw new BadRequestException(
          `Failed to check existing like: ${likeError.message}`,
        );
      }

      if (existingLike && existingLike.length > 0) {
        // User already has a like/dislike, remove it
        const { error: deleteError } = await this.supabaseService.delete(
          'project_likes',
          {
            id: existingLike[0].id,
          },
        );

        if (deleteError) {
          this.logger.error(`Error deleting like: ${deleteError.message}`);
          throw new BadRequestException(
            `Failed to delete like: ${deleteError.message}`,
          );
        }

        this.logger.log(
          `Successfully removed like/dislike for project ${projectId}`,
        );

        return {
          data: null,
          message: 'Like/dislike removed successfully',
          status: 'success',
        };
      } else {
        // User doesn't have a like/dislike, create a new like
        const { data: newLike, error: createError } =
          await this.supabaseService.insert('project_likes', {
            project_id: projectId,
            user_id: userId,
            is_like: true, // Always create a like when toggling
          });

        if (createError) {
          this.logger.error(`Error creating like: ${createError.message}`);
          throw new BadRequestException(
            `Failed to create like: ${createError.message}`,
          );
        }

        this.logger.log(`Successfully created like for project ${projectId}`);

        return {
          data: this.convertProjectLikeToDto(newLike),
          message: 'Project liked successfully',
          status: 'success',
        };
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in toggleProjectLike: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getProjectLikesStats(
    projectId: string,
    userId?: string,
  ): Promise<StandardResponseDto<ProjectLikesStatsDto>> {
    try {
      this.logger.log(`Getting likes stats for project ${projectId}`);

      // Get likes count
      const { data: likes, error: likesError } =
        await this.supabaseService.supabase
          .from('project_likes')
          .select('*', { count: 'exact' })
          .eq('project_id', projectId)
          .eq('is_like', true);

      if (likesError) {
        this.logger.error(`Error fetching likes: ${likesError.message}`);
        throw new BadRequestException(
          `Failed to fetch likes: ${likesError.message}`,
        );
      }

      // Get dislikes count
      const { data: dislikes, error: dislikesError } =
        await this.supabaseService.supabase
          .from('project_likes')
          .select('*', { count: 'exact' })
          .eq('project_id', projectId)
          .eq('is_like', false);

      if (dislikesError) {
        this.logger.error(`Error fetching dislikes: ${dislikesError.message}`);
        throw new BadRequestException(
          `Failed to fetch dislikes: ${dislikesError.message}`,
        );
      }

      const likesCount = likes?.length || 0;
      const dislikesCount = dislikes?.length || 0;

      let userLiked: boolean | undefined;
      let userDisliked: boolean | undefined;

      // If user is provided, check their like/dislike status
      if (userId) {
        const { data: userLike, error: userLikeError } =
          await this.supabaseService.select('project_likes', {
            eq: { project_id: projectId, user_id: userId },
          });

        if (userLikeError) {
          this.logger.warn(
            `Error fetching user like status: ${userLikeError.message}`,
          );
        } else if (userLike && userLike.length > 0) {
          userLiked = userLike[0].is_like;
          userDisliked = !userLike[0].is_like;
        }
      }

      const stats: ProjectLikesStats = {
        likes_count: likesCount,
        dislikes_count: dislikesCount,
        user_liked: userLiked,
        user_disliked: userDisliked,
      };

      this.logger.log(
        `Successfully fetched likes stats: ${likesCount} likes, ${dislikesCount} dislikes`,
      );

      return {
        data: stats,
        message: 'Project likes stats retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getProjectLikesStats: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // CONVERSION FUNCTIONS FOR LIKES
  // =====================================================

  private convertProjectLikeToDto(
    projectLike: ProjectLike,
  ): ProjectLikeResponseDto {
    return {
      id: projectLike.id,
      project_id: projectLike.project_id,
      user_id: projectLike.user_id,
      is_like: projectLike.is_like,
      created_at: projectLike.created_at,
      updated_at: projectLike.updated_at,
    };
  }
}
