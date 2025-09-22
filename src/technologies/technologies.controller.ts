import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';

import { FileUploadService } from '../file-upload/file-upload.service';

import { AuthGuard } from '../auth/guards/auth.guard';

import { TechnologiesService } from './technologies.service';

import {
  CreateTechnologyDto,
  UpdateTechnologyDto,
  TechnologyQueryDto,
} from './dto/technologies.dto';
import type { RootResponse } from 'src/common/types';
import type {
  TechnologiesResponse,
  Technology,
} from './types/technologies.types';

@Controller('technologies')
export class TechnologiesController {
  constructor(
    private readonly technologiesService: TechnologiesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('icon'))
  async createTechnology(
    @Body() createDto: CreateTechnologyDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    icon?: Express.Multer.File,
  ): Promise<RootResponse<Technology>> {
    const technology =
      await this.technologiesService.createTechnology(createDto);

    if (icon && technology.data) {
      try {
        const uploadResult = await this.fileUploadService.uploadTechnologyIcon(
          icon,
          technology.data.id,
        );

        const updateData = {
          icon_url: uploadResult.url,
          icon_filename: uploadResult.filename,
          icon_size: icon.size,
        };

        return this.technologiesService.updateTechnology(
          technology.data.id,
          updateData,
        );
      } catch (error) {
        console.error('Icon upload failed:', error);
        return technology;
      }
    }

    return technology;
  }

  @Post(':id/icon')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('icon'))
  async uploadTechnologyIcon(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<RootResponse<Technology>> {
    const existingTech = await this.technologiesService.getTechnologyById(id);
    if (!existingTech.data) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    const uploadResult = await this.fileUploadService.uploadTechnologyIcon(
      file,
      id,
    );

    const updateData = {
      icon_url: uploadResult.url,
      icon_filename: uploadResult.filename,
      icon_size: file.size,
    };

    return this.technologiesService.updateTechnology(id, updateData);
  }

  @Get()
  async getTechnologies(
    @Query() query: TechnologyQueryDto,
  ): Promise<RootResponse<TechnologiesResponse>> {
    return this.technologiesService.getTechnologies(query);
  }

  @Get(':id')
  async getTechnologyById(
    @Param('id') id: string,
  ): Promise<RootResponse<Technology>> {
    return this.technologiesService.getTechnologyById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateTechnology(
    @Param('id') id: string,
    @Body() updateDto: UpdateTechnologyDto,
  ): Promise<RootResponse<Technology>> {
    return this.technologiesService.updateTechnology(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteTechnology(@Param('id') id: string): Promise<RootResponse<null>> {
    return this.technologiesService.deleteTechnology(id);
  }
}
