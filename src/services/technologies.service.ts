import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import type { UserProfile } from '../types/auth.types';
import {
  CreateTechnologyDto,
  UpdateTechnologyDto,
  TechnologyQueryDto,
  TechnologyResponseDto,
  BulkCreateTechnologiesDto,
} from '../dto/technologies.dto';

// Define proper types for Supabase client operations
interface SupabaseClient {
  from: (table: string) => SupabaseQueryBuilder;
}

interface SupabaseQueryBuilder {
  select: (
    columns?: string | string[],
    options?: { count: string },
  ) => SupabaseQueryBuilder;
  insert: (data: Record<string, unknown>) => SupabaseQueryBuilder;
  update: (data: Record<string, unknown>) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  eq: (column: string, value: unknown) => SupabaseQueryBuilder;
  neq: (column: string, value: unknown) => SupabaseQueryBuilder;
  or: (filter: string) => SupabaseQueryBuilder;
  ilike: (column: string, value: string) => SupabaseQueryBuilder;
  contains: (column: string, value: unknown) => SupabaseQueryBuilder;
  order: (
    column: string,
    options: { ascending: boolean },
  ) => SupabaseQueryBuilder;
  range: (from: number, to: number) => SupabaseQueryBuilder;
  single: () => Promise<{ data: unknown; error: unknown }>;
  // When awaited, the query builder returns the result
  then: (
    onfulfilled?:
      | ((value: { data: unknown; error: unknown; count?: unknown }) => unknown)
      | null,
    onrejected?: ((reason: unknown) => unknown) | null,
  ) => Promise<{ data: unknown; error: unknown; count?: unknown }>;
}

interface TechnologyRow {
  id: string;
  label: string;
  value: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class TechnologiesService {
  private readonly logger = new Logger(TechnologiesService.name);

  constructor(private supabase: SupabaseService) {}

  private ensureAdminOrThrow(user?: UserProfile): void {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  private toDto(row: TechnologyRow): TechnologyResponseDto {
    return {
      id: row.id,
      label: row.label,
      value: row.value,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private getSupabaseClient(): SupabaseClient {
    // Access the internal Supabase client through a type-safe wrapper
    const client = this.supabase as unknown as { supabase: SupabaseClient };
    if (!client.supabase) {
      throw new Error('Supabase client unavailable');
    }
    return client.supabase;
  }

  private async validateUniqueValue(
    value: string,
    excludeId?: string,
  ): Promise<void> {
    const supa = this.getSupabaseClient();

    let query = supa.from('technologies').select('id').eq('value', value);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(
        `Validate unique value error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to validate technology uniqueness');
    }

    if (data && (data as unknown[]).length > 0) {
      throw new ConflictException(
        `Technology with value '${value}' already exists`,
      );
    }
  }

  private async validateUniqueLabel(
    label: string,
    excludeId?: string,
  ): Promise<void> {
    const supa = this.getSupabaseClient();

    let query = supa.from('technologies').select('id').eq('label', label);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(
        `Validate unique label error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException(
        'Failed to validate technology label uniqueness',
      );
    }

    if (data && (data as unknown[]).length > 0) {
      throw new ConflictException(
        `Technology with label '${label}' already exists`,
      );
    }
  }

  async create(
    user: UserProfile | undefined,
    dto: CreateTechnologyDto,
  ): Promise<TechnologyResponseDto> {
    this.ensureAdminOrThrow(user);

    // Validate uniqueness
    await this.validateUniqueValue(dto.value);
    await this.validateUniqueLabel(dto.label);

    const supa = this.getSupabaseClient();

    const payload = {
      label: dto.label.trim(),
      value: dto.value.trim().toLowerCase(),
    };

    const { data, error } = await supa
      .from('technologies')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create technology error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create technology');
    }

    return this.toDto(data as TechnologyRow);
  }

  async bulkCreate(
    user: UserProfile | undefined,
    dto: BulkCreateTechnologiesDto,
  ): Promise<TechnologyResponseDto[]> {
    this.ensureAdminOrThrow(user);

    const supa = this.getSupabaseClient();
    const results: TechnologyResponseDto[] = [];
    const errors: string[] = [];

    // Process each technology individually to handle validation and conflicts
    for (const tech of dto.technologies) {
      try {
        // Validate uniqueness for each technology
        await this.validateUniqueValue(tech.value);
        await this.validateUniqueLabel(tech.label);

        const payload = {
          label: tech.label.trim(),
          value: tech.value.trim().toLowerCase(),
        };

        const { data, error } = await supa
          .from('technologies')
          .insert(payload)
          .select()
          .single();

        if (error) {
          errors.push(
            `Failed to create '${tech.label}': ${(error as { message: string }).message}`,
          );
        } else {
          results.push(this.toDto(data as TechnologyRow));
        }
      } catch (error) {
        if (error instanceof ConflictException) {
          errors.push(`Technology '${tech.label}' already exists`);
        } else {
          errors.push(`Failed to create '${tech.label}': ${error.message}`);
        }
      }
    }

    if (errors.length > 0) {
      this.logger.warn(
        `Bulk create completed with errors: ${errors.join('; ')}`,
      );
    }

    return results;
  }

  async update(
    user: UserProfile | undefined,
    id: string,
    dto: UpdateTechnologyDto,
  ): Promise<TechnologyResponseDto> {
    this.ensureAdminOrThrow(user);

    // Check if technology exists
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Technology not found');
    }

    // Validate uniqueness if updating value or label
    if (dto.value && dto.value !== existing.value) {
      await this.validateUniqueValue(dto.value, id);
    }

    if (dto.label && dto.label !== existing.label) {
      await this.validateUniqueLabel(dto.label, id);
    }

    const supa = this.getSupabaseClient();

    const updates: Record<string, unknown> = {};
    if (dto.label !== undefined) updates.label = dto.label.trim();
    if (dto.value !== undefined) updates.value = dto.value.trim().toLowerCase();

    const { data, error } = await supa
      .from('technologies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update technology error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update technology');
    }

    return this.toDto(data as TechnologyRow);
  }

  async delete(user: UserProfile | undefined, id: string): Promise<void> {
    this.ensureAdminOrThrow(user);

    // Check if technology exists
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Technology not found');
    }

    // Check if technology is being used in any projects
    const supa = this.getSupabaseClient();
    const { data: projectsUsingTech, error: checkError } = await supa
      .from('projects')
      .select('id, name')
      .contains('technologies', [existing.value]);

    if (checkError) {
      this.logger.error(
        `Check technology usage error: ${(checkError as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to check technology usage');
    }

    if (projectsUsingTech && (projectsUsingTech as unknown[]).length > 0) {
      const projectNames = (projectsUsingTech as unknown[])
        .map((p: any) => p.name)
        .join(', ');
      throw new BadRequestException(
        `Cannot delete technology '${existing.label}' as it is used in projects: ${projectNames}`,
      );
    }

    // Delete the technology
    const { error } = await supa.from('technologies').delete().eq('id', id);

    if (error) {
      this.logger.error(
        `Delete technology error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete technology');
    }
  }

  async findAll(
    query: TechnologyQueryDto,
  ): Promise<{ data: TechnologyResponseDto[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa.from('technologies').select('*', { count: 'exact' });

    // Apply search filter if provided
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.or(`label.ilike.${searchTerm},value.ilike.${searchTerm}`);
    }

    req = req.order('label', { ascending: true }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List technologies error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch technologies');
    }

    return {
      data: (data as TechnologyRow[]).map((row) => this.toDto(row)),
      total: (count as number) ?? 0,
    };
  }

  async findOne(id: string): Promise<TechnologyResponseDto | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('technologies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get technology error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch technology');
    }

    return this.toDto(data as TechnologyRow);
  }

  async findByValue(value: string): Promise<TechnologyResponseDto | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('technologies')
      .select('*')
      .eq('value', value.toLowerCase())
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get technology by value error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch technology');
    }

    return this.toDto(data as TechnologyRow);
  }

  async getAllTechnologies(): Promise<TechnologyResponseDto[]> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('technologies')
      .select('*')
      .order('label', { ascending: true });

    if (error) {
      this.logger.error(
        `Get all technologies error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch technologies');
    }

    return (data as TechnologyRow[]).map((row) => this.toDto(row));
  }

  async getTechnologiesForProjects(): Promise<string[]> {
    const technologies = await this.getAllTechnologies();
    return technologies.map((tech) => tech.value);
  }
}
