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
} from './types/projects.types';
import {
  StandardResponseDto,
  ProjectListResponseDto,
  ProjectWithTechnologiesDto,
  ProjectDto,
  ProjectStatusEnum,
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
        data: this.convertProjectToDto(data[0]),
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
}
