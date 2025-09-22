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
} from '@nestjs/common';

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
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createTechnology(
    @Body() createDto: CreateTechnologyDto,
  ): Promise<RootResponse<Technology>> {
    return this.technologiesService.createTechnology(createDto);
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
