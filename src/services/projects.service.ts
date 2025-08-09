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

    // Insert into DB via Supabase REST (use service role)
    // We use the Supabase JS client accessible via SupabaseService using any table insert through RPC
    // Since SupabaseService does not expose generic query, we'll access the internal client through a minimal wrapper pattern using any.
    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

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

    const { data, error } = await (supa.from('projects') as any)
      .insert(payload)
      .select()
      .single();
    if (error) {
      this.logger.error(`Create project error: ${error.message}`);
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

    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

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

    const { data, error } = await (supa.from('projects') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      this.logger.error(`Update project error: ${error.message}`);
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

    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

    const { error } = await (supa.from('projects') as any)
      .delete()
      .eq('id', id);
    if (error) {
      this.logger.error(`Delete project error: ${error.message}`);
      throw new BadRequestException('Failed to delete project');
    }
  }

  async findAll(
    query: ProjectQueryDto,
    user?: UserProfile,
  ): Promise<{ data: ProjectResponseDto[]; total: number }> {
    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Join with user_profiles to get creator information
    let req = (supa.from('projects') as any).select(
      `
        *,
        user_profiles!projects_user_id_fkey(
          avatar_url,
          name
        )
      `,
      { count: 'exact' },
    );

    // Return all projects (both public and private)

    if (query.q) {
      const term = `%${query.q}%`;
      req = req.or(`name.ilike.${term},description.ilike.${term}`);
    }

    if (query.technology && query.technology.length > 0) {
      // technologies is an array<string>; use contains operator
      req = req.contains('technologies', query.technology);
    }

    req = req.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(`List projects error: ${error.message}`);
      throw new BadRequestException('Failed to fetch projects');
    }

    // Transform the joined data
    const transformedData = (data as any[]).map((row) => ({
      ...row,
      creator_avatar_url: row.user_profiles?.avatar_url || null,
      creator_name: row.user_profiles?.name || null,
    }));

    return {
      data: transformedData.map((r) => this.toDto(r as ProjectRow)),
      total: count ?? 0,
    };
  }

  // Admin-only method to get all projects (including private ones)
  async findAllForAdmin(
    query: ProjectQueryDto,
    user: UserProfile,
  ): Promise<{ data: ProjectResponseDto[]; total: number }> {
    this.ensureAdminOrThrow(user);

    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Join with user_profiles to get creator information
    let req = (supa.from('projects') as any).select(
      `
        *,
        user_profiles!projects_user_id_fkey(
          avatar_url,
          name
        )
      `,
      { count: 'exact' },
    );

    if (query.q) {
      const term = `%${query.q}%`;
      req = req.or(`name.ilike.${term},description.ilike.${term}`);
    }

    if (query.technology && query.technology.length > 0) {
      req = req.contains('technologies', query.technology);
    }

    req = req.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(`Admin list projects error: ${error.message}`);
      throw new BadRequestException('Failed to fetch projects');
    }

    // Transform the joined data
    const transformedData = (data as any[]).map((row) => ({
      ...row,
      creator_avatar_url: row.user_profiles?.avatar_url || null,
      creator_name: row.user_profiles?.name || null,
    }));

    return {
      data: transformedData.map((r) => this.toDto(r as ProjectRow)),
      total: count ?? 0,
    };
  }

  async findOne(id: string, user?: UserProfile): Promise<ProjectResponseDto> {
    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

    // Join with user_profiles to get creator information
    let req = (supa.from('projects') as any)
      .select(
        `
        *,
        user_profiles!projects_user_id_fkey(
          avatar_url,
          name
        )
      `,
      )
      .eq('id', id)
      .single();

    const { data, error } = await req;
    if (error) {
      this.logger.error(`Get project error: ${error.message}`);
      throw new BadRequestException('Failed to fetch project');
    }

    // Transform the joined data
    const transformedData = {
      ...data,
      creator_avatar_url: data.user_profiles?.avatar_url || null,
      creator_name: data.user_profiles?.name || null,
    };

    const dto = this.toDto(transformedData as ProjectRow);
    const isAdmin = !!user && user.role === 'ADMIN';
    if (!dto.isPublic && !isAdmin) {
      throw new ForbiddenException('This project is not public');
    }
    return dto;
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
