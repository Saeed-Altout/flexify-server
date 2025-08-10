import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import type { UserProfile } from '../types/auth.types';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectResponseDto,
  ProjectStatusEnum,
} from '../dto/projects.dto';

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
  or: (filter: string) => SupabaseQueryBuilder;
  contains: (column: string, value: unknown) => SupabaseQueryBuilder;
  in: (column: string, values: unknown[]) => SupabaseQueryBuilder;
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

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string;
  brief: string;
  technologies: string[];
  github_link: string | null;
  demo_link: string | null;
  is_featured: boolean;
  is_public: boolean;
  status: ProjectStatusEnum;
  start_date: string | null;
  end_date: string | null;
  likes: number;
  comments: number | null;
  created_at: string;
  updated_at: string;
  // Joined user profile data
  creator_avatar_url?: string | null;
  creator_name?: string | null;
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private supabase: SupabaseService) {}

  private ensureAdminOrThrow(user?: UserProfile): void {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  private toDto(row: ProjectRow): ProjectResponseDto {
    return {
      id: row.id,
      name: row.name,
      logoUrl: row.logo_url,
      coverUrl: row.cover_url,
      description: row.description,
      brief: row.brief,
      technologies: row.technologies,
      githubLink: row.github_link,
      demoLink: row.demo_link,
      isFeatured: row.is_featured,
      isPublic: row.is_public,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      likes: row.likes,
      comments: row.comments ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      avatarUrl: row.creator_avatar_url,
      creatorName: row.creator_name,
    };
  }

  private validateDates(start?: string, end?: string): void {
    if (start && end) {
      if (new Date(start).getTime() > new Date(end).getTime()) {
        throw new BadRequestException(
          'startDate must be before or equal to endDate',
        );
      }
    }
  }

  private getSupabaseClient(): SupabaseClient {
    // Access the internal Supabase client through a type-safe wrapper
    const client = this.supabase as unknown as { supabase: SupabaseClient };
    if (!client.supabase) {
      throw new Error('Supabase client unavailable');
    }
    return client.supabase;
  }

  async create(
    user: UserProfile | undefined,
    dto: CreateProjectDto,
    files: {
      logo?: { buffer: Buffer; mimetype: string };
      cover?: { buffer: Buffer; mimetype: string };
    },
  ): Promise<ProjectResponseDto> {
    this.ensureAdminOrThrow(user);
    // After ensureAdminOrThrow, user is guaranteed to be defined and have ADMIN role
    if (!user) {
      throw new ForbiddenException('Admin privileges required');
    }

    this.validateDates(dto.startDate, dto.endDate);

    // Upload files first (optional)
    let logoUrl: string | null = null;
    let coverUrl: string | null = null;
    if (files.logo) {
      this.assertImage(files.logo.mimetype, files.logo.buffer.length);
      logoUrl = await this.supabase.uploadPublicAsset(
        `projects/logos/${Date.now()}-${Math.random().toString(36).slice(2)}`,
        files.logo.buffer,
        files.logo.mimetype,
      );
    }
    if (files.cover) {
      this.assertImage(files.cover.mimetype, files.cover.buffer.length);
      coverUrl = await this.supabase.uploadPublicAsset(
        `projects/covers/${Date.now()}-${Math.random().toString(36).slice(2)}`,
        files.cover.buffer,
        files.cover.mimetype,
      );
    }

    // Insert into DB via Supabase REST
    const supa = this.getSupabaseClient();

    const payload = {
      user_id: user.id,
      name: dto.name,
      logo_url: logoUrl,
      cover_url: coverUrl,
      description: dto.description,
      brief: dto.brief,
      technologies: dto.technologies,
      github_link: dto.githubLink ?? null,
      demo_link: dto.demoLink ?? null,
      is_featured: dto.isFeatured ?? false,
      is_public: dto.isPublic,
      status: dto.status,
      start_date: dto.startDate ?? null,
      end_date: dto.endDate ?? null,
      likes: dto.likes ?? 0,
    };

    const { data, error } = await supa
      .from('projects')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create project error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create project');
    }

    return this.toDto(data as ProjectRow);
  }

  async update(
    user: UserProfile | undefined,
    id: string,
    dto: UpdateProjectDto,
    files: {
      logo?: { buffer: Buffer; mimetype: string };
      cover?: { buffer: Buffer; mimetype: string };
    },
  ): Promise<ProjectResponseDto> {
    this.ensureAdminOrThrow(user);
    // After ensureAdminOrThrow, user is guaranteed to be defined and have ADMIN role
    if (!user) {
      throw new ForbiddenException('Admin privileges required');
    }

    if (dto.startDate || dto.endDate) {
      this.validateDates(dto.startDate, dto.endDate);
    }

    let logoUrl: string | undefined;
    let coverUrl: string | undefined;
    if (files.logo) {
      this.assertImage(files.logo.mimetype, files.logo.buffer.length);
      logoUrl = await this.supabase.uploadPublicAsset(
        `projects/logos/${Date.now()}-${Math.random().toString(36).slice(2)}`,
        files.logo.buffer,
        files.logo.mimetype,
      );
    }
    if (files.cover) {
      this.assertImage(files.cover.mimetype, files.cover.buffer.length);
      coverUrl = await this.supabase.uploadPublicAsset(
        `projects/covers/${Date.now()}-${Math.random().toString(36).slice(2)}`,
        files.cover.buffer,
        files.cover.mimetype,
      );
    }

    const supa = this.getSupabaseClient();

    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.brief !== undefined) updates.brief = dto.brief;
    if (dto.technologies !== undefined) updates.technologies = dto.technologies;
    if (dto.githubLink !== undefined) updates.github_link = dto.githubLink;
    if (dto.demoLink !== undefined) updates.demo_link = dto.demoLink;
    if (dto.isFeatured !== undefined) updates.is_featured = dto.isFeatured;
    if (dto.isPublic !== undefined) updates.is_public = dto.isPublic;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.startDate !== undefined) updates.start_date = dto.startDate;
    if (dto.endDate !== undefined) updates.end_date = dto.endDate;
    if (dto.likes !== undefined) updates.likes = dto.likes;
    if (logoUrl !== undefined) updates.logo_url = logoUrl;
    if (coverUrl !== undefined) updates.cover_url = coverUrl;

    const { data, error } = await supa
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update project error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update project');
    }

    return this.toDto(data as ProjectRow);
  }

  async delete(user: UserProfile | undefined, id: string): Promise<void> {
    this.ensureAdminOrThrow(user);
    // After ensureAdminOrThrow, user is guaranteed to be defined and have ADMIN role
    if (!user) {
      throw new ForbiddenException('Admin privileges required');
    }

    const supa = this.getSupabaseClient();

    const { error } = await supa.from('projects').delete().eq('id', id);

    if (error) {
      this.logger.error(
        `Delete project error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete project');
    }
  }

  async findAll(
    query: ProjectQueryDto,
  ): Promise<{ data: ProjectResponseDto[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get projects with pagination and filters
    let req = supa.from('projects').select('*', { count: 'exact' });

    // Return all projects (both public and private)

    if (query.q) {
      const term = `%${query.q}%`;
      req = req.or(`name.ilike.${term},description.ilike.${term}`);
    }

    if (query.technology) {
      // technology is now a single string; use contains operator
      req = req.contains('technologies', [query.technology]);
    }

    if (query.isFeatured !== undefined) {
      // Convert string "true"/"false" to boolean for database query
      const isFeatured = query.isFeatured === 'true';
      req = req.eq('is_featured', isFeatured);
    }

    req = req.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List projects error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch projects');
    }

    // Transform the data (without user profile info for now)
    const transformedData = (data as unknown[]).map((row: unknown) => ({
      ...(row as Record<string, unknown>),
      creator_avatar_url: null,
      creator_name: null,
    }));

    return {
      data: transformedData.map((r) => this.toDto(r as ProjectRow)),
      total: (count as number) ?? 0,
    };
  }

  // Admin-only method to get all projects (including private ones)
  async findAllForAdmin(
    query: ProjectQueryDto,
  ): Promise<{ data: ProjectResponseDto[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get projects with pagination and filters
    let req = supa.from('projects').select('*', { count: 'exact' });

    if (query.q) {
      const term = `%${query.q}%`;
      req = req.or(`name.ilike.${term},description.ilike.${term}`);
    }

    if (query.technology) {
      req = req.contains('technologies', [query.technology]);
    }

    if (query.isFeatured !== undefined) {
      // Convert string "true"/"false" to boolean for database query
      const isFeatured = query.isFeatured === 'true';
      req = req.eq('is_featured', isFeatured);
    }

    req = req.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List projects error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch projects');
    }

    // Transform the data (without user profile info for now)
    const transformedData = (data as unknown[]).map((row: unknown) => ({
      ...(row as Record<string, unknown>),
      creator_avatar_url: null,
      creator_name: null,
    }));

    return {
      data: transformedData.map((r) => this.toDto(r as ProjectRow)),
      total: (count as number) ?? 0,
    };
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(
        `Get project error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch project');
    }

    if (!data) {
      throw new BadRequestException('Project not found');
    }

    // Transform the data (without user profile info for now)
    const transformedData = {
      ...(data as Record<string, unknown>),
      creator_avatar_url: null,
      creator_name: null,
    };

    return this.toDto(transformedData as ProjectRow);
  }

  async getAllTechnologies(): Promise<string[]> {
    const supa = this.getSupabaseClient();

    // Get all projects and extract technologies
    const { data, error } = await supa.from('projects').select('technologies');

    if (error) {
      this.logger.error(
        `Get technologies error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch technologies');
    }

    if (!data) {
      return [];
    }

    // Extract all technologies from all projects and flatten
    const allTechnologies = (data as unknown[]).flatMap((row: unknown) => {
      const project = row as { technologies: string[] };
      return project.technologies || [];
    });

    // Remove duplicates and sort alphabetically
    const uniqueTechnologies = [...new Set(allTechnologies)].sort();

    return uniqueTechnologies;
  }

  private assertImage(mime: string, bytes: number) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(mime)) {
      throw new BadRequestException('Invalid image type');
    }
    const max = 5 * 1024 * 1024; // 5MB
    if (bytes > max) {
      throw new BadRequestException('Image size exceeds 5MB limit');
    }
  }
}
