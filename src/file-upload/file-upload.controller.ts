import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileUploadService } from './file-upload.service';
import type { UserProfile } from '../auth/types/auth.types';

// File interface for multer
interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@ApiTags('File Upload')
@Controller('file-upload')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Profile picture file (All common image formats: JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, max 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Profile picture uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Public URL of the uploaded file',
            },
            path: { type: 'string', description: 'Storage path of the file' },
            filename: { type: 'string', description: 'Generated filename' },
          },
        },
        message: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadProfilePicture(
    @Request() req: { user: UserProfile },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      }),
    )
    file: MulterFile,
  ) {
    const result = await this.fileUploadService.uploadProfilePicture(
      {
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      },
      req.user.id,
    );

    return {
      data: result,
      message: 'Profile picture uploaded successfully',
      status: 'success',
    };
  }

  @Post('project-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload project image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Project image file (All common image formats: JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, max 10MB)',
        },
        projectId: {
          type: 'string',
          description: 'Optional project ID for organizing images',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Public URL of the uploaded file',
            },
            path: { type: 'string', description: 'Storage path of the file' },
            filename: { type: 'string', description: 'Generated filename' },
          },
        },
        message: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadProjectImage(
    @Request() req: { user: UserProfile },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: MulterFile,
    @Body('projectId') projectId?: string,
  ) {
    const result = await this.fileUploadService.uploadProjectImage(
      {
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      },
      req.user.id,
      projectId,
    );

    return {
      data: result,
      message: 'Project image uploaded successfully',
      status: 'success',
    };
  }
}
