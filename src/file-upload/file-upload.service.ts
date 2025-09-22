import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface FileUploadResult {
  url: string;
  path: string;
  filename: string;
}

const imageMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/avif',
  'image/heic',
  'image/heif',
];

export const imageMaxSize = 10 * 1024 * 1024; // 10MB for project images
export const profileImageMaxSize = 5 * 1024 * 1024; // 5MB for profile images

export const pdfMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/rtf',
];

export const pdfMaxSize = 5 * 1024 * 1024;

@Injectable()
export class FileUploadService {
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseKey = this.configService.get<string>(
        'SUPABASE_SERVICE_ROLE_KEY',
      );

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured',
        );
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    return this.supabase;
  }

  async uploadProfilePicture(
    file: UploadedFile,
    userId: string,
  ): Promise<FileUploadResult> {
    return this.uploadFile(
      file,
      'profile-pictures',
      `user-${userId}`,
      imageMimeTypes,
      profileImageMaxSize,
    );
  }

  async uploadProjectImage(
    file: UploadedFile,
    userId: string,
    projectId?: string,
  ): Promise<FileUploadResult> {
    const folder = projectId
      ? `user-${userId}/project-${projectId}`
      : `user-${userId}`;

    return this.uploadFile(
      file,
      'project-images',
      folder,
      imageMimeTypes,
      imageMaxSize,
    );
  }

  async uploadCVFile(
    file: UploadedFile,
    userId: string,
  ): Promise<FileUploadResult> {
    return this.uploadFile(
      file,
      'cv-files',
      `user-${userId}`,
      pdfMimeTypes,
      pdfMaxSize,
    );
  }

  async uploadTechnologyIcon(
    file: UploadedFile,
    technologyId: string,
  ): Promise<FileUploadResult> {
    return this.uploadFile(
      file,
      'technology-icons',
      `tech-${technologyId}`,
      imageMimeTypes,
      imageMaxSize,
    );
  }

  private async uploadFile(
    file: UploadedFile,
    bucket: string,
    folder: string,
    allowedMimeTypes: string[],
    maxSize: number,
  ): Promise<FileUploadResult> {
    // Validate file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${maxSize / (1024 * 1024)}MB`,
      );
    }

    // Validate file buffer
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File buffer is empty');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension =
      file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filePath = `${folder}/${filename}`;

    try {
      const supabase = this.getSupabaseClient();

      // Upload file with proper metadata
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false, // Don't overwrite existing files
        });

      if (error) {
        throw new BadRequestException(
          `Failed to upload file: ${error.message}`,
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        filename,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        throw new BadRequestException('Failed to delete file');
      }
    } catch (error) {
      throw new BadRequestException('File deletion failed');
    }
  }
}
