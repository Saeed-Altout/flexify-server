import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import {
  ImageUploadResponse,
  ImageListResponse,
  ImageDeleteResponse,
} from './types/images.types';
import { ImageQueryDto } from './dto/images.dto';
import { RootResponse } from '../common/types';

@Injectable()
export class ImagesService {
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
   * Upload image
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<RootResponse<ImageUploadResponse>> {
    try {
      // Validate file
      this.validateImageFile(file);

      // Upload image
      const uploadResult = await this.fileUploadService.uploadProjectImage(
        {
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        },
        userId,
      );

      // Store image metadata in database
      const { data, error } = await this.supabaseService.insert('images', {
        url: uploadResult.url,
        filename: uploadResult.filename,
        path: uploadResult.path,
        size: file.size,
        mimetype: file.mimetype,
        user_id: userId,
      });

      if (error) {
        throw new BadRequestException(
          `Failed to save image metadata: ${error.message}`,
        );
      }

      const imageResponse: ImageUploadResponse = {
        id: data.id,
        url: uploadResult.url,
        filename: uploadResult.filename,
        path: uploadResult.path,
        size: file.size,
        mimetype: file.mimetype,
        uploaded_at: data.created_at,
      };

      return {
        data: imageResponse,
        message: 'Image uploaded successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user's images
   */
  async getUserImages(
    userId: string,
    query: ImageQueryDto = {},
  ): Promise<RootResponse<ImageListResponse>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let supabaseQuery = this.supabaseService.supabase
        .from('images')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (query.search && query.search.trim() !== '') {
        supabaseQuery = supabaseQuery.or(
          `filename.ilike.%${query.search}%,mimetype.ilike.%${query.search}%`,
        );
      }

      if (query.mimetype && query.mimetype.trim() !== '') {
        supabaseQuery = supabaseQuery.eq('mimetype', query.mimetype);
      }

      // Handle sorting
      const sortBy = query.sort_by || 'created_at';
      const sortOrder = query.sort_order || 'desc';
      const ascending = sortOrder === 'asc';

      supabaseQuery = supabaseQuery
        .order(sortBy, { ascending })
        .range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        throw new BadRequestException(
          `Failed to fetch images: ${error.message}`,
        );
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const images: ImageUploadResponse[] = (data || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        path: img.path,
        size: img.size,
        mimetype: img.mimetype,
        uploaded_at: img.created_at,
      }));

      const result: ImageListResponse = {
        images,
        total,
        page,
        limit,
        total_pages: totalPages,
      };

      return {
        data: result,
        message: 'Images retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get image by ID
   */
  async getImageById(
    imageId: string,
    userId: string,
  ): Promise<RootResponse<ImageUploadResponse>> {
    try {
      const { data, error } = await this.supabaseService.select('images', {
        eq: { id: imageId, user_id: userId },
      });

      if (error) {
        throw new BadRequestException(
          `Failed to fetch image: ${error.message}`,
        );
      }

      if (!data || data.length === 0) {
        throw new NotFoundException(`Image with ID ${imageId} not found`);
      }

      const image: ImageUploadResponse = {
        id: data[0].id,
        url: data[0].url,
        filename: data[0].filename,
        path: data[0].path,
        size: data[0].size,
        mimetype: data[0].mimetype,
        uploaded_at: data[0].created_at,
      };

      return {
        data: image,
        message: 'Image retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete image
   */
  async deleteImage(
    imageId: string,
    userId: string,
  ): Promise<RootResponse<ImageDeleteResponse>> {
    try {
      // Get image first to verify ownership
      const { data: image, error: fetchError } =
        await this.supabaseService.select('images', {
          eq: { id: imageId, user_id: userId },
        });

      if (fetchError) {
        throw new BadRequestException(
          `Failed to fetch image: ${fetchError.message}`,
        );
      }

      if (!image || image.length === 0) {
        throw new NotFoundException(`Image with ID ${imageId} not found`);
      }

      // Delete from database
      const { error: deleteError } = await this.supabaseService.delete(
        'images',
        { id: imageId },
      );

      if (deleteError) {
        throw new BadRequestException(
          `Failed to delete image: ${deleteError.message}`,
        );
      }

      const result: ImageDeleteResponse = {
        deleted_id: imageId,
        deleted_url: image[0].url,
      };

      return {
        data: result,
        message: 'Image deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Bulk delete images
   */
  async bulkDeleteImages(
    imageIds: string[],
    userId: string,
  ): Promise<RootResponse<{ deleted_count: number; deleted_ids: string[] }>> {
    try {
      // Verify all images belong to user
      const { data: images, error: fetchError } =
        await this.supabaseService.supabase
          .from('images')
          .select('id')
          .in('id', imageIds)
          .eq('user_id', userId);

      if (fetchError) {
        throw new BadRequestException(
          `Failed to fetch images: ${fetchError.message}`,
        );
      }

      if (!images || images.length === 0) {
        throw new NotFoundException('No images found to delete');
      }

      const foundIds = images.map((img: any) => img.id);

      // Delete from database
      const { error: deleteError } = await this.supabaseService.supabase
        .from('images')
        .delete()
        .in('id', foundIds);

      if (deleteError) {
        throw new BadRequestException(
          `Failed to delete images: ${deleteError.message}`,
        );
      }

      return {
        data: {
          deleted_count: foundIds.length,
          deleted_ids: foundIds,
        },
        message: `${foundIds.length} images deleted successfully`,
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Private helper methods
   */
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
