import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectResponseDto,
  ProjectStatusEnum,
} from '../dto/projects.dto';

interface ProjectRow {
  id: string;
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
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  private ensureAdminOrThrow(userEmail?: string): void {
    const admins: string[] = this.config.get<string[]>('admin.emails') || [];
    if (!userEmail || !admins.includes(userEmail)) {
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
    userEmail: string | undefined,
    dto: CreateProjectDto,
    files: {
      logo?: { buffer: Buffer; mimetype: string };
      cover?: { buffer: Buffer; mimetype: string };
    },
  ): Promise<ProjectResponseDto> {
    this.ensureAdminOrThrow(userEmail);
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
    userEmail: string | undefined,
    id: string,
    dto: UpdateProjectDto,
    files: {
      logo?: { buffer: Buffer; mimetype: string };
      cover?: { buffer: Buffer; mimetype: string };
    },
  ): Promise<ProjectResponseDto> {
    this.ensureAdminOrThrow(userEmail);
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

  async delete(userEmail: string | undefined, id: string): Promise<void> {
    this.ensureAdminOrThrow(userEmail);
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
    userEmail?: string,
  ): Promise<{ data: ProjectResponseDto[]; total: number }> {
    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = (supa.from('projects') as any).select('*', { count: 'exact' });

    const admins: string[] = this.config.get<string[]>('admin.emails') || [];
    const isAdmin = !!userEmail && admins.includes(userEmail);
    if (!isAdmin || !query.includePrivate) {
      req = req.eq('is_public', true);
    }

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
    return {
      data: (data as ProjectRow[]).map((r) => this.toDto(r)),
      total: count ?? 0,
    };
  }

  async findOne(id: string, userEmail?: string): Promise<ProjectResponseDto> {
    const client: any = this.supabase as unknown as { [k: string]: any };
    const supa = client['supabase'] as { from: Function };
    if (!supa) throw new Error('Supabase client unavailable');

    let req = (supa.from('projects') as any).select('*').eq('id', id).single();
    const { data, error } = await req;
    if (error) {
      this.logger.error(`Get project error: ${error.message}`);
      throw new BadRequestException('Failed to fetch project');
    }
    const dto = this.toDto(data as ProjectRow);
    const admins: string[] = this.config.get<string[]>('admin.emails') || [];
    const isAdmin = !!userEmail && admins.includes(userEmail);
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
