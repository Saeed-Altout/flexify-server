import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceQueryDto,
} from './dto/services.dto';
import { Service, ServicesResponse } from './types/services.types';
import { RootResponse } from '../common/types';

@Injectable()
export class ServicesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createService(
    createDto: CreateServiceDto,
  ): Promise<RootResponse<Service>> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('services')
        .insert([
          {
            name: createDto.name,
            icon_url: createDto.icon_url,
            description: createDto.description,
            href: createDto.href,
            is_active: createDto.is_active ?? true,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new BadRequestException(
          `Failed to create service: ${error.message}`,
        );
      }

      return {
        data,
        message: 'Service created successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getServices(
    query: ServiceQueryDto = {},
  ): Promise<RootResponse<ServicesResponse>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const offset = (page - 1) * limit;

      let queryBuilder = this.supabaseService.supabase
        .from('services')
        .select('*', { count: 'exact' });

      if (query.is_active !== undefined) {
        queryBuilder = queryBuilder.eq('is_active', query.is_active);
      }
      if (query.search && query.search.trim() !== '') {
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
          `Failed to fetch services: ${error.message}`,
        );
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const result: ServicesResponse = {
        services: data || [],
        total,
        page,
        limit,
        total_pages: totalPages,
      };

      return {
        data: result,
        message: 'Services retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getServiceById(id: string): Promise<RootResponse<Service>> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException('Service not found');
        }
        throw new BadRequestException(
          `Failed to fetch service: ${error.message}`,
        );
      }

      return {
        data,
        message: 'Service retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateService(
    id: string,
    updateDto: UpdateServiceDto,
  ): Promise<RootResponse<Service>> {
    try {
      const updateData: any = {};

      if (updateDto.name !== undefined) updateData.name = updateDto.name;
      if (updateDto.icon_url !== undefined)
        updateData.icon_url = updateDto.icon_url;
      if (updateDto.description !== undefined)
        updateData.description = updateDto.description;
      if (updateDto.href !== undefined) updateData.href = updateDto.href;
      if (updateDto.is_active !== undefined)
        updateData.is_active = updateDto.is_active;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabaseService.supabase
        .from('services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException('Service not found');
        }
        throw new BadRequestException(
          `Failed to update service: ${error.message}`,
        );
      }

      return {
        data,
        message: 'Service updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteService(id: string): Promise<RootResponse<null>> {
    try {
      const { error } = await this.supabaseService.supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        throw new BadRequestException(
          `Failed to delete service: ${error.message}`,
        );
      }

      return {
        data: null,
        message: 'Service deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
