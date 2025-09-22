import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { FileUploadService } from '../../file-upload/file-upload.service';
import {
  ProjectImage,
  ProjectCover,
  ProjectImageUploadResponse,
  ProjectCoverUploadResponse,
} from '../types/projects.types';

@Injectable()
export class ProjectImageService {
  private readonly MAX_IMAGES_PER_PROJECT = 10;
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
   * Upload project cover image
   */
  async uploadProjectCover(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<ProjectCoverUploadResponse> {
    // Validate file
    this.validateImageFile(file);

    // Verify project ownership
    const project = await this.verifyProjectOwnership(projectId, userId);

    // Get previous cover for cleanup
    const previousCover = project.cover;

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

    // Update project with new cover
    const { error: updateError } = await this.supabaseService.update(
      'projects',
      { cover: uploadResult.url },
      { id: projectId },
    );

    if (updateError) {
      throw new BadRequestException(
        `Failed to update project cover: ${updateError.message}`,
      );
    }

    // Create cover object
    const cover: ProjectCover = {
      url: uploadResult.url,
      filename: uploadResult.filename,
      path: uploadResult.path,
      size: file.size,
      mimetype: file.mimetype,
      uploaded_at: new Date().toISOString(),
    };

    return {
      cover,
      previous_cover: previousCover,
    };
  }

  /**
   * Upload project image
   */
  async uploadProjectImage(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<ProjectImageUploadResponse> {
    // Validate file
    this.validateImageFile(file);

    // Verify project ownership
    const project = await this.verifyProjectOwnership(projectId, userId);

    // Check image limit
    const currentImages = project.images || [];
    if (currentImages.length >= this.MAX_IMAGES_PER_PROJECT) {
      throw new BadRequestException(
        `Maximum number of images (${this.MAX_IMAGES_PER_PROJECT}) reached for this project`,
      );
    }

    // Upload new image
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

    // Add new image to project
    const updatedImages = [...currentImages, uploadResult.url];

    const { error: updateError } = await this.supabaseService.update(
      'projects',
      { images: updatedImages },
      { id: projectId },
    );

    if (updateError) {
      throw new BadRequestException(
        `Failed to update project images: ${updateError.message}`,
      );
    }

    // Create image object
    const image: ProjectImage = {
      id: uploadResult.filename, // Using filename as ID for now
      url: uploadResult.url,
      filename: uploadResult.filename,
      path: uploadResult.path,
      size: file.size,
      mimetype: file.mimetype,
      uploaded_at: new Date().toISOString(),
    };

    return {
      image,
      total_images: updatedImages.length,
      remaining_slots: this.MAX_IMAGES_PER_PROJECT - updatedImages.length,
    };
  }

  /**
   * Delete project image
   */
  async deleteProjectImage(
    projectId: string,
    imageUrl: string,
    userId: string,
  ): Promise<{ deleted_url: string; remaining_images: number }> {
    // Verify project ownership
    const project = await this.verifyProjectOwnership(projectId, userId);

    // Remove image from project
    const currentImages = project.images || [];
    const updatedImages = currentImages.filter(
      (img: string) => img !== imageUrl,
    );

    if (currentImages.length === updatedImages.length) {
      throw new NotFoundException('Image not found in project');
    }

    const { error: updateError } = await this.supabaseService.update(
      'projects',
      { images: updatedImages },
      { id: projectId },
    );

    if (updateError) {
      throw new BadRequestException(
        `Failed to remove project image: ${updateError.message}`,
      );
    }

    return {
      deleted_url: imageUrl,
      remaining_images: updatedImages.length,
    };
  }

  /**
   * Get project images
   */
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    const project = await this.verifyProjectExists(projectId);
    const images = project.images || [];

    return images.map((url: string, index: number) => ({
      id: `img-${index}`,
      url,
      filename: this.extractFilenameFromUrl(url),
      path: this.extractPathFromUrl(url),
      size: 0, // Size not stored in database
      mimetype: this.getMimeTypeFromUrl(url),
      uploaded_at: project.created_at, // Fallback to project creation date
    }));
  }

  /**
   * Get project cover
   */
  async getProjectCover(projectId: string): Promise<ProjectCover | null> {
    const project = await this.verifyProjectExists(projectId);

    if (!project.cover) {
      return null;
    }

    return {
      url: project.cover,
      filename: this.extractFilenameFromUrl(project.cover),
      path: this.extractPathFromUrl(project.cover),
      size: 0, // Size not stored in database
      mimetype: this.getMimeTypeFromUrl(project.cover),
      uploaded_at: project.created_at, // Fallback to project creation date
    };
  }

  /**
   * Replace project cover (delete old, upload new)
   */
  async replaceProjectCover(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<ProjectCoverUploadResponse> {
    // Get current project to check for existing cover
    const project = await this.verifyProjectOwnership(projectId, userId);
    const previousCover = project.cover;

    // Upload new cover
    const result = await this.uploadProjectCover(projectId, file, userId);

    return {
      ...result,
      previous_cover: previousCover,
    };
  }

  /**
   * Clear all project images
   */
  async clearAllProjectImages(
    projectId: string,
    userId: string,
  ): Promise<{ cleared_count: number }> {
    // Verify project ownership
    const project = await this.verifyProjectOwnership(projectId, userId);
    const currentImages = project.images || [];

    if (currentImages.length === 0) {
      return { cleared_count: 0 };
    }

    const { error: updateError } = await this.supabaseService.update(
      'projects',
      { images: [] },
      { id: projectId },
    );

    if (updateError) {
      throw new BadRequestException(
        `Failed to clear project images: ${updateError.message}`,
      );
    }

    return { cleared_count: currentImages.length };
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

  private extractFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private extractPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return 'unknown';
    }
  }

  private getMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[extension || ''] || 'image/jpeg';
  }
}
