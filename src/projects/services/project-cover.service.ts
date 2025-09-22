import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { FileUploadService } from '../../file-upload/file-upload.service';

@Injectable()
export class ProjectCoverService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  constructor(
    private supabaseService: SupabaseService,
    private fileUploadService: FileUploadService,
  ) {}

  /**
   * Upload project cover
   */
  async uploadProjectCover(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ cover_url: string; previous_cover_url?: string }> {
    // Validate file
    this.validateImageFile(file);

    // Verify project ownership
    const project = await this.verifyProjectOwnership(projectId, userId);

    // Get previous cover for cleanup
    const previousCoverUrl = project.cover_url;

    // Upload new cover
    const uploadResult = await this.fileUploadService.uploadProjectImage(
      {
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      },
      userId,
      projectId,
    );

    // Update project with new cover URL
    const { error: updateError } = await this.supabaseService.update(
      'projects',
      { cover_url: uploadResult.url },
      { id: projectId },
    );

    if (updateError) {
      throw new BadRequestException(
        `Failed to update project cover: ${updateError.message}`,
      );
    }

    return {
      cover_url: uploadResult.url,
      previous_cover_url: previousCoverUrl,
    };
  }

  /**
   * Delete project cover
   */
  async deleteProjectCover(
    projectId: string,
    userId: string,
  ): Promise<{ deleted_cover_url: string }> {
    // Verify project ownership
    const project = await this.verifyProjectOwnership(projectId, userId);

    if (!project.cover_url) {
      throw new NotFoundException('No cover found for this project');
    }

    const currentCoverUrl = project.cover_url;

    // Remove cover from project
    const { error: updateError } = await this.supabaseService.update(
      'projects',
      { cover_url: null },
      { id: projectId },
    );

    if (updateError) {
      throw new BadRequestException(
        `Failed to remove project cover: ${updateError.message}`,
      );
    }

    return {
      deleted_cover_url: currentCoverUrl,
    };
  }

  /**
   * Get project cover URL
   */
  async getProjectCover(projectId: string): Promise<string | null> {
    const project = await this.verifyProjectExists(projectId);
    return project.cover_url || null;
  }

  /**
   * Private helper methods
   */
  private async verifyProjectOwnership(projectId: string, userId: string) {
    const { data: project, error } = await this.supabaseService.select(
      'projects',
      {
        eq: { id: projectId },
      },
    );

    if (error) {
      throw new BadRequestException(
        `Failed to fetch project: ${error.message}`,
      );
    }

    if (!project || project.length === 0) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project[0].user_id !== userId) {
      throw new ForbiddenException('You can only manage your own projects');
    }

    return project[0];
  }

  private async verifyProjectExists(projectId: string) {
    const { data: project, error } = await this.supabaseService.select(
      'projects',
      {
        eq: { id: projectId },
      },
    );

    if (error) {
      throw new BadRequestException(
        `Failed to fetch project: ${error.message}`,
      );
    }

    if (!project || project.length === 0) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return project[0];
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File buffer is empty');
    }
  }
}
