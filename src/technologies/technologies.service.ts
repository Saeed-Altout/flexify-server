import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type {
  TechnologiesQuery,
  TechnologiesResponse,
  Technology,
} from './types/technologies.types';
import type {
  CreateTechnologyDto,
  UpdateTechnologyDto,
} from './dto/technologies.dto';
import type { RootResponse } from 'src/common/types';

import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TechnologiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createTechnology(
    createDto: CreateTechnologyDto,
  ): Promise<RootResponse<Technology>> {
    try {
      const { data, error } = await this.supabaseService.insert(
        'technologies',
        {
          name: createDto.name,
          description: createDto.description,
          category: createDto.category,
          is_active: createDto.is_active ?? true,
          icon_url: createDto.icon_url,
        },
      );

      if (error) {
        throw new BadRequestException(
          `Failed to create technology: ${error.message}`,
        );
      }

      return {
        data: data,
        message: 'Technology created successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getTechnologies(
    query: TechnologiesQuery = {},
  ): Promise<RootResponse<TechnologiesResponse>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const offset = (page - 1) * limit;

      let queryBuilder = this.supabaseService.supabase
        .from('technologies')
        .select('*', { count: 'exact' });

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

      const sortBy = query.sort_by || 'name';
      const sortOrder = query.sort_order || 'asc';
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === 'asc',
      });

      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data, error, count } = await queryBuilder;

      if (error) {
        throw new BadRequestException(
          `Failed to fetch technologies: ${error.message}`,
        );
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const result: TechnologiesResponse = {
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
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getTechnologyById(id: string): Promise<RootResponse<Technology>> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('technologies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
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
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateTechnology(
    id: string,
    updateDto: UpdateTechnologyDto,
  ): Promise<RootResponse<Technology>> {
    try {
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
        throw new BadRequestException(
          `Failed to update technology: ${error.message}`,
        );
      }

      const updatedTech = await this.getTechnologyById(id);

      return {
        data: updatedTech.data,
        message: 'Technology updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteTechnology(id: string): Promise<RootResponse<null>> {
    try {
      const existingTechResponse = await this.getTechnologyById(id);

      if (!existingTechResponse.data) {
        throw new NotFoundException(`Technology with ID ${id} not found`);
      }

      const { error } = await this.supabaseService.delete('technologies', {
        id,
      });

      if (error) {
        throw new BadRequestException(
          `Failed to delete technology: ${error.message}`,
        );
      }

      return {
        data: null,
        message: 'Technology deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
