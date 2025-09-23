import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/types/auth.types';
import {
  ImageQueryDto,
  DeleteImageDto,
  BulkDeleteImagesDto,
} from './dto/images.dto';
import { RootResponse } from '../common/types';
import type {
  ImageUploadResponse,
  ImageListResponse,
  ImageDeleteResponse,
} from './types/images.types';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<RootResponse<ImageUploadResponse>> {
    return this.imagesService.uploadImage(file, user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getUserImages(
    @Query() query: ImageQueryDto,
    @CurrentUser() user: User,
  ): Promise<RootResponse<ImageListResponse>> {
    return this.imagesService.getUserImages(user.id, query);
  }

  @Delete('bulk')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async bulkDeleteImages(
    @Body() deleteDto: BulkDeleteImagesDto,
    @CurrentUser() user: User,
  ): Promise<RootResponse<{ deleted_count: number; deleted_ids: string[] }>> {
    return this.imagesService.bulkDeleteImages(deleteDto.image_ids, user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getImageById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<RootResponse<ImageUploadResponse>> {
    return this.imagesService.getImageById(id, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteImage(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<RootResponse<ImageDeleteResponse>> {
    return this.imagesService.deleteImage(id, user.id);
  }
}
