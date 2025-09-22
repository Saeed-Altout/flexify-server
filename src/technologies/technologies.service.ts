import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type {
  Technology,
  TechnologyQuery,
  TechnologyListResponse,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
} from './types/technologies.types';
import type { StandardResponseDto } from './dto/technologies.dto';

@Injectable()
export class TechnologiesService {
  private readonly logger = new Logger(TechnologiesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async createTechnology(
    createDto: CreateTechnologyRequest,
  ): Promise<StandardResponseDto<Technology>> {
    try {
      this.logger.log('Creating new technology');

      const { data, error } = await this.supabaseService.insert(
        'technologies',
        {
          name: createDto.name,
          description: createDto.description,
          category: createDto.category,
          is_active: createDto.is_active ?? true,
        },
      );

      if (error) {
        this.logger.error(`Error creating technology: ${error.message}`);
        throw new BadRequestException(
          `Failed to create technology: ${error.message}`,
        );
      }

      this.logger.log(`Technology created successfully: ${data.id}`);

      return {
        data,
        message: 'Technology created successfully',
        status: 'success',
      };
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

  async getActiveTechnologies(): Promise<StandardResponseDto<Technology[]>> {
    try {
      this.logger.log('Fetching active technologies');

      const { data, error } = await this.supabaseService.select(
        'technologies',
        {
          eq: { is_active: true },
          order: { column: 'name', ascending: true },
        },
      );

      if (error) {
        this.logger.error(
          `Error fetching active technologies: ${error.message}`,
        );
        throw new BadRequestException(
          `Failed to fetch active technologies: ${error.message}`,
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
      this.logger.error(`Error in getActiveTechnologies: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async searchTechnologies(
    searchTerm: string,
  ): Promise<StandardResponseDto<Technology[]>> {
    try {
      this.logger.log(`Searching technologies with term: ${searchTerm}`);

      const { data, error } = await this.supabaseService.supabase
        .from('technologies')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
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

  async getTechnologiesByCategory(
    category: string,
  ): Promise<StandardResponseDto<Technology[]>> {
    try {
      this.logger.log(`Fetching technologies by category: ${category}`);

      const { data, error } = await this.supabaseService.select(
        'technologies',
        {
          eq: { category, is_active: true },
          order: { column: 'name', ascending: true },
        },
      );

      if (error) {
        this.logger.error(
          `Error fetching technologies by category: ${error.message}`,
        );
        throw new BadRequestException(
          `Failed to fetch technologies by category: ${error.message}`,
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

  async getTechnologyById(
    id: string,
  ): Promise<StandardResponseDto<Technology>> {
    try {
      this.logger.log(`Fetching technology by ID: ${id}`);

      const { data, error } = await this.supabaseService.select(
        'technologies',
        {
          eq: { id },
          single: true,
        },
      );

      if (error) {
        this.logger.error(`Error fetching technology: ${error.message}`);
        throw new BadRequestException(
          `Failed to fetch technology: ${error.message}`,
        );
      }

      if (!data) {
        throw new NotFoundException(`Technology with ID ${id} not found`);
      }

      return {
        data,
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
  ): Promise<StandardResponseDto<Technology>> {
    try {
      this.logger.log(`Updating technology: ${id}`);

      // Check if technology exists
      const existingTechResponse = await this.getTechnologyById(id);
      if (!existingTechResponse.data) {
        throw new NotFoundException(`Technology with ID ${id} not found`);
      }

      const { data, error } = await this.supabaseService.update(
        'technologies',
        {
          ...updateDto,
          updated_at: new Date().toISOString(),
        },
        { id },
      );

      if (error) {
        this.logger.error(`Error updating technology: ${error.message}`);
        throw new BadRequestException(
          `Failed to update technology: ${error.message}`,
        );
      }

      this.logger.log(`Technology updated successfully: ${id}`);

      return {
        data,
        message: 'Technology updated successfully',
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
      const existingTechResponse = await this.getTechnologyById(id);
      if (!existingTechResponse.data) {
        throw new NotFoundException(`Technology with ID ${id} not found`);
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

      this.logger.log(`Technology deleted successfully: ${id}`);

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
}
