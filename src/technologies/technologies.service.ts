import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import {
  Technology,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
  TechnologyQuery,
  TechnologyListResponse,
} from './types/technologies.types';
import {
  StandardResponseDto,
  TechnologyListResponseDto,
} from './dto/technologies.dto';

@Injectable()
export class TechnologiesService {
  private readonly logger = new Logger(TechnologiesService.name);

  constructor(
    private supabaseService: SupabaseService,
    private fileUploadService: FileUploadService,
  ) {}

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  async createTechnology(
    createDto: CreateTechnologyRequest,
    iconFile?: Express.Multer.File,
  ): Promise<StandardResponseDto<Technology>> {
    try {
      this.logger.log(`Creating technology: ${createDto.name}`);

      // Check if technology already exists
      const existingTech = await this.getTechnologyByName(createDto.name);
      if (existingTech) {
        throw new BadRequestException(
          'Technology with this name already exists',
        );
      }

      // Create technology data
      const technologyData: any = {
        name: createDto.name,
        description: createDto.description,
        category: createDto.category,
        is_active: true,
      };

      // Handle icon upload if provided
      if (iconFile) {
        this.logger.log(`Uploading icon for technology: ${createDto.name}`);

        // First create the technology to get an ID
        const { data: techData, error: techError } =
          await this.supabaseService.insert('technologies', technologyData);

        if (techError) {
          this.logger.error(`Error creating technology: ${techError.message}`);
          throw new BadRequestException(
            `Failed to create technology: ${techError.message}`,
          );
        }

        // Upload the icon
        const iconResult = await this.fileUploadService.uploadTechnologyIcon(
          {
            originalname: iconFile.originalname,
            buffer: iconFile.buffer,
            mimetype: iconFile.mimetype,
            size: iconFile.size,
          },
          techData.id,
        );

        // Update technology with icon information
        const { data: updatedData, error: updateError } =
          await this.supabaseService.updateTechnologyIcon(
            techData.id,
            iconResult.url,
            iconFile.originalname,
            iconFile.size,
          );

        if (updateError) {
          this.logger.error(
            `Error updating technology with icon: ${updateError.message}`,
          );
          throw new BadRequestException(
            `Failed to update technology with icon: ${updateError.message}`,
          );
        }

        this.logger.log(
          `Successfully created technology with icon: ${techData.id}`,
        );

        return {
          data: updatedData.data,
          message: 'Technology created successfully with icon',
          status: 'success',
        };
      } else {
        // Create technology without icon
        const { data, error } = await this.supabaseService.insert(
          'technologies',
          technologyData,
        );

        if (error) {
          this.logger.error(`Error creating technology: ${error.message}`);
          throw new BadRequestException(
            `Failed to create technology: ${error.message}`,
          );
        }

        this.logger.log(`Successfully created technology: ${data.id}`);

        return {
          data: data,
          message: 'Technology created successfully',
          status: 'success',
        };
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in createTechnology: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getTechnologies(
    query: TechnologyQuery = {},
  ): Promise<StandardResponseDto<TechnologyListResponse>> {
    try {
      this.logger.log('Fetching technologies');

      const page = query.page || 1;
      const limit = query.limit || 10;
      const offset = (page - 1) * limit;

      // Build query
      let queryBuilder = this.supabaseService.supabase
        .from('technologies')
        .select('*', { count: 'exact' });

      // Apply filters
      if (query.category) {
        queryBuilder = queryBuilder.eq('category', query.category);
      }
      if (query.is_active !== undefined) {
        queryBuilder = queryBuilder.eq('is_active', query.is_active);
      }
      if (query.search) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query.search}%,description.ilike.%${query.search}%`,
        );
      }

      // Apply sorting
      const sortBy = query.sort_by || 'name';
      const sortOrder = query.sort_order || 'asc';
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === 'asc',
      });

      // Apply pagination
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data, error, count } = await queryBuilder;

      if (error) {
        this.logger.error(`Error fetching technologies: ${error.message}`);
        throw new BadRequestException(
          `Failed to fetch technologies: ${error.message}`,
        );
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const result: TechnologyListResponse = {
        technologies: data || [],
        total,
        page,
        limit,
        total_pages: totalPages,
      };

      return {
        data: result,
        message: 'Technologies retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getTechnologies: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getTechnologyById(
    id: string,
  ): Promise<StandardResponseDto<Technology>> {
    try {
      this.logger.log(`Fetching technology: ${id}`);

      const { data, error } = await this.supabaseService.supabase
        .from('technologies')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException('Technology not found');
      }

      return {
        data: data,
        message: 'Technology retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getTechnologyById: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateTechnology(
    id: string,
    updateDto: UpdateTechnologyRequest,
    iconFile?: Express.Multer.File,
  ): Promise<StandardResponseDto<Technology>> {
    try {
      this.logger.log(`Updating technology: ${id}`);

      // Check if technology exists
      const existingTech = await this.getTechnologyById(id);
      if (!existingTech) {
        throw new NotFoundException('Technology not found');
      }

      // Check if name is being changed and if it conflicts
      if (updateDto.name && updateDto.name !== existingTech.data.name) {
        const nameConflict = await this.getTechnologyByName(updateDto.name);
        if (nameConflict) {
          throw new BadRequestException(
            'Technology with this name already exists',
          );
        }
      }

      // Prepare update data
      const updateData: any = { ...updateDto };

      // Handle icon upload if provided
      if (iconFile) {
        this.logger.log(`Uploading new icon for technology: ${id}`);

        // Upload the new icon
        const iconResult = await this.fileUploadService.uploadTechnologyIcon(
          {
            originalname: iconFile.originalname,
            buffer: iconFile.buffer,
            mimetype: iconFile.mimetype,
            size: iconFile.size,
          },
          id,
        );

        // Add icon information to update data
        updateData.icon_url = iconResult.url;
        updateData.icon_filename = iconFile.originalname;
        updateData.icon_size = iconFile.size;
        updateData.icon_uploaded_at = new Date().toISOString();
      }

      const { data, error } = await this.supabaseService.update(
        'technologies',
        updateData,
        { id },
      );

      if (error) {
        this.logger.error(`Error updating technology: ${error.message}`);
        throw new BadRequestException(
          `Failed to update technology: ${error.message}`,
        );
      }

      this.logger.log(`Successfully updated technology: ${id}`);

      return {
        data: data,
        message: iconFile
          ? 'Technology updated successfully with new icon'
          : 'Technology updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateTechnology: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteTechnology(id: string): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log(`Deleting technology: ${id}`);

      // Check if technology exists
      const existingTech = await this.getTechnologyById(id);
      if (!existingTech) {
        throw new NotFoundException('Technology not found');
      }

      const { error } = await this.supabaseService.delete('technologies', {
        id,
      });

      if (error) {
        this.logger.error(`Error deleting technology: ${error.message}`);
        throw new BadRequestException(
          `Failed to delete technology: ${error.message}`,
        );
      }

      this.logger.log(`Successfully deleted technology: ${id}`);

      return {
        data: null,
        message: 'Technology deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in deleteTechnology: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  async getTechnologyByName(name: string): Promise<Technology | null> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('technologies')
        .select('*')
        .eq('name', name)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error: any) {
      this.logger.error(`Error in getTechnologyByName: ${error.message}`);
      return null;
    }
  }

  async getTechnologiesByCategory(
    category: string,
  ): Promise<StandardResponseDto<Technology[]>> {
    try {
      this.logger.log(`Fetching technologies by category: ${category}`);

      const { data, error } = await this.supabaseService.supabase
        .from('technologies')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        this.logger.error(
          `Error fetching technologies by category: ${error.message}`,
        );
        throw new BadRequestException(
          `Failed to fetch technologies: ${error.message}`,
        );
      }

      return {
        data: data || [],
        message: 'Technologies retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getTechnologiesByCategory: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getActiveTechnologies(): Promise<StandardResponseDto<Technology[]>> {
    try {
      this.logger.log('Fetching active technologies');

      const { data, error } = await this.supabaseService.supabase
        .from('technologies')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        this.logger.error(
          `Error fetching active technologies: ${error.message}`,
        );
        throw new BadRequestException(
          `Failed to fetch technologies: ${error.message}`,
        );
      }

      return {
        data: data || [],
        message: 'Active technologies retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async searchTechnologies(
    searchTerm: string,
  ): Promise<StandardResponseDto<Technology[]>> {
    try {
      this.logger.log(`Searching technologies: ${searchTerm}`);

      const { data, error } = await this.supabaseService.supabase
        .from('technologies')
        .select('*')
        .or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`,
        )
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        this.logger.error(`Error searching technologies: ${error.message}`);
        throw new BadRequestException(
          `Failed to search technologies: ${error.message}`,
        );
      }

      return {
        data: data || [],
        message: 'Search results retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in searchTechnologies: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
