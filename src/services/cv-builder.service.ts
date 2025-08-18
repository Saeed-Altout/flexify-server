import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { TechnologiesService } from './technologies.service';
import type { UserProfile } from '../types/auth.types';
import {
  CVSectionRow,
  CVPersonalInfoRow,
  CVSkillRow,
  CVExperienceRow,
  CVEducationRow,
  CVCertificationRow,
  CVAwardRow,
  CVInterestRow,
  CVReferenceRow,
  CVExperienceTechnologyRow,
  CVSectionResponse,
  CVPersonalInfoResponse,
  CVSkillResponse,
  CVExperienceResponse,
  CVEducationResponse,
  CVCertificationResponse,
  CVAwardResponse,
  CVInterestResponse,
  CVReferenceResponse,
  CompleteCVResponse,
} from '../types/cv-builder.types';
import {
  CreateCVPersonalInfoDto,
  UpdateCVPersonalInfoDto,
  CreateCVSkillDto,
  UpdateCVSkillDto,
  CreateCVExperienceDto,
  UpdateCVExperienceDto,
  CreateCVEducationDto,
  UpdateCVEducationDto,
  CreateCVCertificationDto,
  UpdateCVCertificationDto,
  CreateCVAwardDto,
  UpdateCVAwardDto,
  CreateCVInterestDto,
  UpdateCVInterestDto,
  CreateCVReferenceDto,
  UpdateCVReferenceDto,
  UpdateCVSectionDto,
  CVQueryDto,
} from '../dto/cv-builder.dto';

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
  then: (
    onfulfilled?:
      | ((value: { data: unknown; error: unknown; count?: unknown }) => unknown)
      | null,
    onrejected?: ((reason: unknown) => unknown) | null,
  ) => Promise<{ data: unknown; error: unknown; count?: unknown }>;
}

@Injectable()
export class CVBuilderService {
  private readonly logger = new Logger(CVBuilderService.name);

  constructor(
    private supabase: SupabaseService,
    private technologiesService: TechnologiesService,
  ) {}

  private ensureAdminOrThrow(user?: UserProfile): void {
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  private getSupabaseClient(): SupabaseClient {
    const client = this.supabase as unknown as { supabase: SupabaseClient };
    if (!client.supabase) {
      throw new Error('Supabase client unavailable');
    }
    return client.supabase;
  }

  // CV Sections Management (Admin only)
  async updateCVSection(
    user: UserProfile | undefined,
    sectionName: string,
    dto: UpdateCVSectionDto,
  ): Promise<CVSectionResponse> {
    this.ensureAdminOrThrow(user);

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.display_name !== undefined)
      updates.display_name = dto.display_name.trim();
    if (dto.description !== undefined)
      updates.description = dto.description?.trim();
    if (dto.is_active !== undefined) updates.is_active = dto.is_active;
    if (dto.is_required !== undefined) updates.is_required = dto.is_required;
    if (dto.sort_order !== undefined) updates.sort_order = dto.sort_order;

    const { data, error } = await supa
      .from('cv_sections')
      .update(updates)
      .eq('name', sectionName)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update CV section error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update CV section');
    }

    return this.toCVSectionDto(data as CVSectionRow);
  }

  async getCVSections(): Promise<CVSectionResponse[]> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      this.logger.error(
        `Get CV sections error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch CV sections');
    }

    return (data as CVSectionRow[]).map((row) => this.toCVSectionDto(row));
  }

  // Personal Info Management
  async createOrUpdatePersonalInfo(
    user: UserProfile | undefined,
    dto: CreateCVPersonalInfoDto,
  ): Promise<CVPersonalInfoResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    // Check if personal info already exists
    const existing = await this.getPersonalInfo(user);

    if (existing) {
      // Update existing
      const updates: Record<string, unknown> = {};
      if (dto.name !== undefined) updates.name = dto.name?.trim();
      if (dto.job_title !== undefined)
        updates.job_title = dto.job_title?.trim();
      if (dto.summary !== undefined) updates.summary = dto.summary?.trim();
      if (dto.profile_picture !== undefined)
        updates.profile_picture = dto.profile_picture;
      if (dto.phone !== undefined) updates.phone = dto.phone?.trim();
      if (dto.email !== undefined) updates.email = dto.email?.trim();
      if (dto.address !== undefined) updates.address = dto.address?.trim();
      if (dto.location !== undefined) updates.location = dto.location?.trim();
      if (dto.website !== undefined) updates.website = dto.website;
      if (dto.linkedin !== undefined) updates.linkedin = dto.linkedin;
      if (dto.github !== undefined) updates.github = dto.github;
      if (dto.core_values !== undefined) updates.core_values = dto.core_values;
      if (dto.birthday !== undefined) updates.birthday = dto.birthday;
      if (dto.experience !== undefined)
        updates.experience = dto.experience?.trim();

      const { data, error } = await supa
        .from('cv_personal_info')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        this.logger.error(
          `Update personal info error: ${(error as { message: string }).message}`,
        );
        throw new BadRequestException('Failed to update personal info');
      }

      return this.toPersonalInfoDto(data as CVPersonalInfoRow);
    } else {
      // Create new
      const payload = {
        user_id: user.id,
        name: dto.name?.trim(),
        job_title: dto.job_title?.trim(),
        summary: dto.summary?.trim(),
        profile_picture: dto.profile_picture,
        phone: dto.phone?.trim(),
        email: dto.email?.trim(),
        address: dto.address?.trim(),
        location: dto.location?.trim(),
        website: dto.website,
        linkedin: dto.linkedin,
        github: dto.github,
        core_values: dto.core_values,
        birthday: dto.birthday,
        experience: dto.experience?.trim(),
      };

      const { data, error } = await supa
        .from('cv_personal_info')
        .insert(payload)
        .select()
        .single();

      if (error) {
        this.logger.error(
          `Create personal info error: ${(error as { message: string }).message}`,
        );
        throw new BadRequestException('Failed to create personal info');
      }

      return this.toPersonalInfoDto(data as CVPersonalInfoRow);
    }
  }

  // Update Personal Info (only for existing records)
  async updatePersonalInfo(
    user: UserProfile | undefined,
    dto: UpdateCVPersonalInfoDto,
  ): Promise<CVPersonalInfoResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    // Check if personal info exists
    const existing = await this.getPersonalInfo(user);
    if (!existing) {
      throw new NotFoundException('Personal information not found');
    }

    // Update existing
    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name?.trim();
    if (dto.job_title !== undefined) updates.job_title = dto.job_title?.trim();
    if (dto.summary !== undefined) updates.summary = dto.summary?.trim();
    if (dto.profile_picture !== undefined)
      updates.profile_picture = dto.profile_picture;
    if (dto.phone !== undefined) updates.phone = dto.phone?.trim();
    if (dto.email !== undefined) updates.email = dto.email?.trim();
    if (dto.address !== undefined) updates.address = dto.address?.trim();
    if (dto.location !== undefined) updates.location = dto.location?.trim();
    if (dto.website !== undefined) updates.website = dto.website;
    if (dto.linkedin !== undefined) updates.linkedin = dto.linkedin;
    if (dto.github !== undefined) updates.github = dto.github;
    if (dto.core_values !== undefined) updates.core_values = dto.core_values;
    if (dto.birthday !== undefined) updates.birthday = dto.birthday;
    if (dto.experience !== undefined)
      updates.experience = dto.experience?.trim();

    const { data, error } = await supa
      .from('cv_personal_info')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update personal info error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update personal info');
    }

    return this.toPersonalInfoDto(data as CVPersonalInfoRow);
  }

  async getPersonalInfo(
    user: UserProfile | undefined,
  ): Promise<CVPersonalInfoResponse | null> {
    if (!user?.id) {
      throw new BadRequestException('User ID is required');
    }

    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_personal_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get personal info error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch personal info');
    }

    return this.toPersonalInfoDto(data as CVPersonalInfoRow);
  }

  // Skills Management
  async createSkill(
    user: UserProfile | undefined,
    dto: CreateCVSkillDto,
  ): Promise<CVSkillResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    const payload = {
      user_id: user.id,
      name: dto.name.trim(),
      description: dto.description?.trim(),
      level: dto.level,
      category: dto.category?.trim(),
    };

    const { data, error } = await supa
      .from('cv_skills')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create skill error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create skill');
    }

    return this.toSkillDto(data as CVSkillRow);
  }

  async updateSkill(
    user: UserProfile | undefined,
    skillId: string,
    dto: UpdateCVSkillDto,
  ): Promise<CVSkillResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getSkill(skillId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Skill not found');
    }

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.name !== undefined) updates.name = dto.name.trim();
    if (dto.description !== undefined)
      updates.description = dto.description?.trim();
    if (dto.level !== undefined) updates.level = dto.level;
    if (dto.category !== undefined) updates.category = dto.category?.trim();

    const { data, error } = await supa
      .from('cv_skills')
      .update(updates)
      .eq('id', skillId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update skill error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update skill');
    }

    return this.toSkillDto(data as CVSkillRow);
  }

  async deleteSkill(
    user: UserProfile | undefined,
    skillId: string,
  ): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getSkill(skillId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Skill not found');
    }

    const supa = this.getSupabaseClient();
    const { error } = await supa.from('cv_skills').delete().eq('id', skillId);

    if (error) {
      this.logger.error(
        `Delete skill error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete skill');
    }
  }

  async getSkill(skillId: string): Promise<CVSkillResponse | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get skill error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch skill');
    }

    return this.toSkillDto(data as CVSkillRow);
  }

  async getSkills(
    userId: string,
    query: CVQueryDto,
  ): Promise<{ data: CVSkillResponse[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa
      .from('cv_skills')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    if (query.category) {
      req = req.eq('category', query.category);
    }

    req = req.order('name', { ascending: true }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List skills error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch skills');
    }

    return {
      data: (data as CVSkillRow[]).map((row) => this.toSkillDto(row)),
      total: (count as number) ?? 0,
    };
  }

  // Experience Management
  async createExperience(
    user: UserProfile | undefined,
    dto: CreateCVExperienceDto,
  ): Promise<CVExperienceResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    // Validate technologies if provided
    if (dto.technologies && dto.technologies.length > 0) {
      for (const techValue of dto.technologies) {
        const tech = await this.technologiesService.findByValue(techValue);
        if (!tech) {
          throw new BadRequestException(`Technology '${techValue}' not found`);
        }
      }
    }

    const payload = {
      user_id: user.id,
      title: dto.title.trim(),
      company: dto.company.trim(),
      project_name: dto.project_name?.trim(),
      seniority_level: dto.seniority_level,
      location: dto.location?.trim(),
      start_date: dto.start_date,
      end_date: dto.end_date,
      is_current: dto.is_current,
      description: dto.description?.trim(),
      key_achievements: dto.key_achievements,
    };

    const { data, error } = await supa
      .from('cv_experience')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create experience error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create experience');
    }

    const experience = this.toExperienceDto(data as CVExperienceRow);

    // Add technologies if provided
    if (dto.technologies && dto.technologies.length > 0) {
      await this.addExperienceTechnologies(experience.id, dto.technologies);
      experience.technologies = dto.technologies;
    }

    return experience;
  }

  async updateExperience(
    user: UserProfile | undefined,
    experienceId: string,
    dto: UpdateCVExperienceDto,
  ): Promise<CVExperienceResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getExperience(experienceId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Experience not found');
    }

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.company !== undefined) updates.company = dto.company.trim();
    if (dto.project_name !== undefined)
      updates.project_name = dto.project_name?.trim();
    if (dto.seniority_level !== undefined)
      updates.seniority_level = dto.seniority_level;
    if (dto.location !== undefined) updates.location = dto.location?.trim();
    if (dto.start_date !== undefined) updates.start_date = dto.start_date;
    if (dto.end_date !== undefined) updates.end_date = dto.end_date;
    if (dto.is_current !== undefined) updates.is_current = dto.is_current;
    if (dto.description !== undefined)
      updates.description = dto.description?.trim();
    if (dto.key_achievements !== undefined)
      updates.key_achievements = dto.key_achievements;

    const { data, error } = await supa
      .from('cv_experience')
      .update(updates)
      .eq('id', experienceId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update experience error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update experience');
    }

    const experience = this.toExperienceDto(data as CVExperienceRow);

    // Update technologies if provided
    if (dto.technologies !== undefined) {
      await this.updateExperienceTechnologies(experienceId, dto.technologies);
      experience.technologies = dto.technologies;
    } else {
      // Get existing technologies
      const techs = await this.getExperienceTechnologies(experienceId);
      experience.technologies = techs;
    }

    return experience;
  }

  async deleteExperience(
    user: UserProfile | undefined,
    experienceId: string,
  ): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getExperience(experienceId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Experience not found');
    }

    const supa = this.getSupabaseClient();

    // Delete related technologies first
    await supa
      .from('cv_experience_technologies')
      .delete()
      .eq('experience_id', experienceId);

    // Delete experience
    const { error } = await supa
      .from('cv_experience')
      .delete()
      .eq('id', experienceId);

    if (error) {
      this.logger.error(
        `Delete experience error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete experience');
    }
  }

  async getExperience(
    experienceId: string,
  ): Promise<CVExperienceResponse | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_experience')
      .select('*')
      .eq('id', experienceId)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get experience error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch experience');
    }

    const experience = this.toExperienceDto(data as CVExperienceRow);

    // Get technologies
    const techs = await this.getExperienceTechnologies(experienceId);
    experience.technologies = techs;

    return experience;
  }

  async getExperiences(
    userId: string,
    query: CVQueryDto,
  ): Promise<{ data: CVExperienceResponse[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa
      .from('cv_experience')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.or(
        `title.ilike.${searchTerm},company.ilike.${searchTerm},description.ilike.${searchTerm}`,
      );
    }

    if (query.company) {
      req = req.eq('company', query.company);
    }

    req = req.order('start_date', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List experiences error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch experiences');
    }

    const experiences = await Promise.all(
      (data as CVExperienceRow[]).map(async (row) => {
        const experience = this.toExperienceDto(row);
        const techs = await this.getExperienceTechnologies(row.id);
        experience.technologies = techs;
        return experience;
      }),
    );

    return {
      data: experiences,
      total: (count as number) ?? 0,
    };
  }

  // Technology Management for Experience
  private async addExperienceTechnologies(
    experienceId: string,
    technologyValues: string[],
  ): Promise<void> {
    const supa = this.getSupabaseClient();

    for (const techValue of technologyValues) {
      const tech = await this.technologiesService.findByValue(techValue);
      if (tech) {
        await supa.from('cv_experience_technologies').insert({
          experience_id: experienceId,
          technology_id: tech.id,
        });
      }
    }
  }

  private async updateExperienceTechnologies(
    experienceId: string,
    technologyValues: string[],
  ): Promise<void> {
    const supa = this.getSupabaseClient();

    // Remove existing technologies
    await supa
      .from('cv_experience_technologies')
      .delete()
      .eq('experience_id', experienceId);

    // Add new technologies
    await this.addExperienceTechnologies(experienceId, technologyValues);
  }

  private async getExperienceTechnologies(
    experienceId: string,
  ): Promise<string[]> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_experience_technologies')
      .select('technology_id')
      .eq('experience_id', experienceId);

    if (error) {
      this.logger.error(
        `Get experience technologies error: ${(error as { message: string }).message}`,
      );
      return [];
    }

    const techIds = (data as { technology_id: string }[]).map(
      (t) => t.technology_id,
    );
    const technologies = await Promise.all(
      techIds.map(async (id) => {
        const tech = await this.technologiesService.findOne(id);
        return tech?.value || '';
      }),
    );

    return technologies.filter((t) => t !== '');
  }

  // Complete CV Generation
  async getCompleteCV(
    user: UserProfile | undefined,
  ): Promise<CompleteCVResponse> {
    if (!user?.id) {
      throw new BadRequestException('User ID is required');
    }

    const [
      sections,
      personalInfo,
      skills,
      experiences,
      education,
      certifications,
      awards,
      interests,
      references,
    ] = await Promise.all([
      this.getCVSections(),
      this.getPersonalInfo(user),
      this.getSkills(user.id, { page: 1, limit: 1000 }),
      this.getExperiences(user.id, { page: 1, limit: 1000 }),
      this.getEducation(user.id, { page: 1, limit: 1000 }),
      this.getCertifications(user.id, { page: 1, limit: 1000 }),
      this.getAwards(user.id, { page: 1, limit: 1000 }),
      this.getInterests(user.id, { page: 1, limit: 1000 }),
      this.getReferences(user.id, { page: 1, limit: 1000 }),
    ]);

    return {
      sections,
      personal_info: personalInfo || undefined,
      skills: skills.data.length > 0 ? skills.data : undefined,
      experience: experiences.data.length > 0 ? experiences.data : undefined,
      education: education.data.length > 0 ? education.data : undefined,
      certifications:
        certifications.data.length > 0 ? certifications.data : undefined,
      awards: awards.data.length > 0 ? awards.data : undefined,
      interests: interests.data.length > 0 ? interests.data : undefined,
      references: references.data.length > 0 ? references.data : undefined,
    };
  }

  // Helper methods for DTO conversion
  private toCVSectionDto(row: CVSectionRow): CVSectionResponse {
    return {
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      is_active: row.is_active,
      is_required: row.is_required,
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toPersonalInfoDto(row: CVPersonalInfoRow): CVPersonalInfoResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      job_title: row.job_title,
      summary: row.summary,
      profile_picture: row.profile_picture,
      phone: row.phone,
      address: row.address,
      website: row.website,
      linkedin: row.linkedin,
      github: row.github,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toSkillDto(row: CVSkillRow): CVSkillResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description,
      level: row.level,
      category: row.category,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // Education Management
  async createEducation(
    user: UserProfile | undefined,
    dto: CreateCVEducationDto,
  ): Promise<CVEducationResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    const payload = {
      user_id: user.id,
      degree: dto.degree.trim(),
      institution: dto.institution.trim(),
      location: dto.location?.trim(),
      start_date: dto.start_date,
      end_date: dto.end_date,
      is_current: dto.is_current,
      description: dto.description?.trim(),
    };

    const { data, error } = await supa
      .from('cv_education')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create education error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create education');
    }

    return this.toEducationDto(data as CVEducationRow);
  }

  async updateEducation(
    user: UserProfile | undefined,
    educationId: string,
    dto: UpdateCVEducationDto,
  ): Promise<CVEducationResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getEducationById(educationId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Education not found');
    }

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.degree !== undefined) updates.degree = dto.degree.trim();
    if (dto.institution !== undefined)
      updates.institution = dto.institution.trim();
    if (dto.location !== undefined) updates.location = dto.location?.trim();
    if (dto.start_date !== undefined) updates.start_date = dto.start_date;
    if (dto.end_date !== undefined) updates.end_date = dto.end_date;
    if (dto.is_current !== undefined) updates.is_current = dto.is_current;
    if (dto.description !== undefined)
      updates.description = dto.description?.trim();

    const { data, error } = await supa
      .from('cv_education')
      .update(updates)
      .eq('id', educationId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update education error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update education');
    }

    return this.toEducationDto(data as CVEducationRow);
  }

  async deleteEducation(
    user: UserProfile | undefined,
    educationId: string,
  ): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getEducationById(educationId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Education not found');
    }

    const supa = this.getSupabaseClient();
    const { error } = await supa
      .from('cv_education')
      .delete()
      .eq('id', educationId);

    if (error) {
      this.logger.error(
        `Delete education error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete education');
    }
  }

  async getEducationById(
    educationId: string,
  ): Promise<CVEducationResponse | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_education')
      .select('*')
      .eq('id', educationId)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get education error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch education');
    }

    return this.toEducationDto(data as CVEducationRow);
  }

  async getEducation(
    userId: string,
    query: CVQueryDto,
  ): Promise<{ data: CVEducationResponse[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa
      .from('cv_education')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.or(
        `degree.ilike.${searchTerm},institution.ilike.${searchTerm},description.ilike.${searchTerm}`,
      );
    }

    if (query.institution) {
      req = req.eq('institution', query.institution);
    }

    req = req.order('start_date', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List education error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch education');
    }

    return {
      data: (data as CVEducationRow[]).map((row) => this.toEducationDto(row)),
      total: (count as number) ?? 0,
    };
  }

  // Certifications Management
  async createCertification(
    user: UserProfile | undefined,
    dto: CreateCVCertificationDto,
  ): Promise<CVCertificationResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    const payload = {
      user_id: user.id,
      name: dto.name.trim(),
      issuer: dto.issuer.trim(),
      issue_date: dto.issue_date,
      expiration_date: dto.expiration_date,
      credential_id: dto.credential_id?.trim(),
      credential_url: dto.credential_url,
    };

    const { data, error } = await supa
      .from('cv_certifications')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create certification error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create certification');
    }

    return this.toCertificationDto(data as CVCertificationRow);
  }

  async updateCertification(
    user: UserProfile | undefined,
    certificationId: string,
    dto: UpdateCVCertificationDto,
  ): Promise<CVCertificationResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getCertification(certificationId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Certification not found');
    }

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.name !== undefined) updates.name = dto.name.trim();
    if (dto.issuer !== undefined) updates.issuer = dto.issuer.trim();
    if (dto.issue_date !== undefined) updates.issue_date = dto.issue_date;
    if (dto.expiration_date !== undefined)
      updates.expiration_date = dto.expiration_date;
    if (dto.credential_id !== undefined)
      updates.credential_id = dto.credential_id?.trim();
    if (dto.credential_url !== undefined)
      updates.credential_url = dto.credential_url;

    const { data, error } = await supa
      .from('cv_certifications')
      .update(updates)
      .eq('id', certificationId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update certification error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update certification');
    }

    return this.toCertificationDto(data as CVCertificationRow);
  }

  async deleteCertification(
    user: UserProfile | undefined,
    certificationId: string,
  ): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getCertification(certificationId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Certification not found');
    }

    const supa = this.getSupabaseClient();
    const { error } = await supa
      .from('cv_certifications')
      .delete()
      .eq('id', certificationId);

    if (error) {
      this.logger.error(
        `Delete certification error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete certification');
    }
  }

  async getCertification(
    certificationId: string,
  ): Promise<CVCertificationResponse | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_certifications')
      .select('*')
      .eq('id', certificationId)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get certification error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch certification');
    }

    return this.toCertificationDto(data as CVCertificationRow);
  }

  async getCertifications(
    userId: string,
    query: CVQueryDto,
  ): Promise<{ data: CVCertificationResponse[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa
      .from('cv_certifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.or(`name.ilike.${searchTerm},issuer.ilike.${searchTerm}`);
    }

    req = req.order('issue_date', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List certifications error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch certifications');
    }

    return {
      data: (data as CVCertificationRow[]).map((row) =>
        this.toCertificationDto(row),
      ),
      total: (count as number) ?? 0,
    };
  }

  // Awards Management
  async createAward(
    user: UserProfile | undefined,
    dto: CreateCVAwardDto,
  ): Promise<CVAwardResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    const payload = {
      user_id: user.id,
      name: dto.name.trim(),
      issuer: dto.issuer.trim(),
      date: dto.date,
      description: dto.description?.trim(),
    };

    const { data, error } = await supa
      .from('cv_awards')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create award error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create award');
    }

    return this.toAwardDto(data as CVAwardRow);
  }

  async updateAward(
    user: UserProfile | undefined,
    awardId: string,
    dto: UpdateCVAwardDto,
  ): Promise<CVAwardResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getAward(awardId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Award not found');
    }

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.name !== undefined) updates.name = dto.name.trim();
    if (dto.issuer !== undefined) updates.issuer = dto.issuer.trim();
    if (dto.date !== undefined) updates.date = dto.date;
    if (dto.description !== undefined)
      updates.description = dto.description?.trim();

    const { data, error } = await supa
      .from('cv_awards')
      .update(updates)
      .eq('id', awardId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update award error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update award');
    }

    return this.toAwardDto(data as CVAwardRow);
  }

  async deleteAward(
    user: UserProfile | undefined,
    awardId: string,
  ): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getAward(awardId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Award not found');
    }

    const supa = this.getSupabaseClient();
    const { error } = await supa.from('cv_awards').delete().eq('id', awardId);

    if (error) {
      this.logger.error(
        `Delete award error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete award');
    }
  }

  async getAward(awardId: string): Promise<CVAwardResponse | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_awards')
      .select('*')
      .eq('id', awardId)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get award error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch award');
    }

    return this.toAwardDto(data as CVAwardRow);
  }

  async getAwards(
    userId: string,
    query: CVQueryDto,
  ): Promise<{ data: CVAwardResponse[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa
      .from('cv_awards')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.or(
        `name.ilike.${searchTerm},issuer.ilike.${searchTerm},description.ilike.${searchTerm}`,
      );
    }

    req = req.order('date', { ascending: false }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List awards error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch awards');
    }

    return {
      data: (data as CVAwardRow[]).map((row) => this.toAwardDto(row)),
      total: (count as number) ?? 0,
    };
  }

  // Interests Management
  async createInterest(
    user: UserProfile | undefined,
    dto: CreateCVInterestDto,
  ): Promise<CVInterestResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    const payload = {
      user_id: user.id,
      name: dto.name.trim(),
    };

    const { data, error } = await supa
      .from('cv_interests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create interest error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create interest');
    }

    return this.toInterestDto(data as CVInterestRow);
  }

  async updateInterest(
    user: UserProfile | undefined,
    interestId: string,
    dto: UpdateCVInterestDto,
  ): Promise<CVInterestResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getInterest(interestId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Interest not found');
    }

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.name !== undefined) updates.name = dto.name.trim();

    const { data, error } = await supa
      .from('cv_interests')
      .update(updates)
      .eq('id', interestId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update interest error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update interest');
    }

    return this.toInterestDto(data as CVInterestRow);
  }

  async deleteInterest(
    user: UserProfile | undefined,
    interestId: string,
  ): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getInterest(interestId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Interest not found');
    }

    const supa = this.getSupabaseClient();
    const { error } = await supa
      .from('cv_interests')
      .delete()
      .eq('id', interestId);

    if (error) {
      this.logger.error(
        `Delete interest error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete interest');
    }
  }

  async getInterest(interestId: string): Promise<CVInterestResponse | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_interests')
      .select('*')
      .eq('id', interestId)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get interest error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch interest');
    }

    return this.toInterestDto(data as CVInterestRow);
  }

  async getInterests(
    userId: string,
    query: CVQueryDto,
  ): Promise<{ data: CVInterestResponse[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa
      .from('cv_interests')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.ilike('name', searchTerm);
    }

    req = req.order('name', { ascending: true }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List interests error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch interests');
    }

    return {
      data: (data as CVInterestRow[]).map((row) => this.toInterestDto(row)),
      total: (count as number) ?? 0,
    };
  }

  // References Management
  async createReference(
    user: UserProfile | undefined,
    dto: CreateCVReferenceDto,
  ): Promise<CVReferenceResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const supa = this.getSupabaseClient();

    const payload = {
      user_id: user.id,
      name: dto.name.trim(),
      position: dto.position.trim(),
      company: dto.company.trim(),
      email: dto.email.trim(),
      phone: dto.phone?.trim(),
    };

    const { data, error } = await supa
      .from('cv_references')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Create reference error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to create reference');
    }

    return this.toReferenceDto(data as CVReferenceRow);
  }

  async updateReference(
    user: UserProfile | undefined,
    referenceId: string,
    dto: UpdateCVReferenceDto,
  ): Promise<CVReferenceResponse> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getReference(referenceId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Reference not found');
    }

    const supa = this.getSupabaseClient();
    const updates: Record<string, unknown> = {};

    if (dto.name !== undefined) updates.name = dto.name.trim();
    if (dto.position !== undefined) updates.position = dto.position.trim();
    if (dto.company !== undefined) updates.company = dto.company.trim();
    if (dto.email !== undefined) updates.email = dto.email.trim();
    if (dto.phone !== undefined) updates.phone = dto.phone?.trim();

    const { data, error } = await supa
      .from('cv_references')
      .update(updates)
      .eq('id', referenceId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Update reference error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to update reference');
    }

    return this.toReferenceDto(data as CVReferenceRow);
  }

  async deleteReference(
    user: UserProfile | undefined,
    referenceId: string,
  ): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Verify ownership
    const existing = await this.getReference(referenceId);
    if (!existing || existing.user_id !== user.id) {
      throw new NotFoundException('Reference not found');
    }

    const supa = this.getSupabaseClient();
    const { error } = await supa
      .from('cv_references')
      .delete()
      .eq('id', referenceId);

    if (error) {
      this.logger.error(
        `Delete reference error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to delete reference');
    }
  }

  async getReference(referenceId: string): Promise<CVReferenceResponse | null> {
    const supa = this.getSupabaseClient();

    const { data, error } = await supa
      .from('cv_references')
      .select('*')
      .eq('id', referenceId)
      .single();

    if (error) {
      if ((error as { code: string }).code === 'PGRST116') {
        return null; // Not found
      }
      this.logger.error(
        `Get reference error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch reference');
    }

    return this.toReferenceDto(data as CVReferenceRow);
  }

  async getReferences(
    userId: string,
    query: CVQueryDto,
  ): Promise<{ data: CVReferenceResponse[]; total: number }> {
    const supa = this.getSupabaseClient();

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let req = supa
      .from('cv_references')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (query.q) {
      const searchTerm = `%${query.q}%`;
      req = req.or(
        `name.ilike.${searchTerm},position.ilike.${searchTerm},company.ilike.${searchTerm}`,
      );
    }

    req = req.order('name', { ascending: true }).range(from, to);

    const { data, error, count } = await req;
    if (error) {
      this.logger.error(
        `List references error: ${(error as { message: string }).message}`,
      );
      throw new BadRequestException('Failed to fetch references');
    }

    return {
      data: (data as CVReferenceRow[]).map((row) => this.toReferenceDto(row)),
      total: (count as number) ?? 0,
    };
  }

  private toExperienceDto(row: CVExperienceRow): CVExperienceResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      company: row.company,
      project_name: row.project_name,
      seniority_level: row.seniority_level,
      location: row.location,
      start_date: row.start_date,
      end_date: row.end_date,
      is_current: row.is_current,
      description: row.description,
      key_achievements: row.key_achievements,
      technologies: [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toEducationDto(row: CVEducationRow): CVEducationResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      degree: row.degree,
      institution: row.institution,
      location: row.location,
      start_date: row.start_date,
      end_date: row.end_date,
      is_current: row.is_current,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toCertificationDto(row: CVCertificationRow): CVCertificationResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      issuer: row.issuer,
      issue_date: row.issue_date,
      expiration_date: row.expiration_date,
      credential_id: row.credential_id,
      credential_url: row.credential_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toAwardDto(row: CVAwardRow): CVAwardResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      issuer: row.issuer,
      date: row.date,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toInterestDto(row: CVInterestRow): CVInterestResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toReferenceDto(row: CVReferenceRow): CVReferenceResponse {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      position: row.position,
      company: row.company,
      email: row.email,
      phone: row.phone,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
