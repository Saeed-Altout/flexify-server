import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
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
      [
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
      ],
      5 * 1024 * 1024, // 5MB limit
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
      [
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
      ],
      10 * 1024 * 1024, // 10MB limit
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

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
    const filePath = `${folder}/${filename}`;

    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
        });

      if (error) {
        this.logger.error(`Upload error: ${error.message}`);
        throw new BadRequestException('Failed to upload file');
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
      this.logger.error(`File upload failed: ${error.message}`);
      throw new BadRequestException('File upload failed');
    }
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        this.logger.error(`Delete error: ${error.message}`);
        throw new BadRequestException('Failed to delete file');
      }
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      throw new BadRequestException('File deletion failed');
    }
  }
}
