import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserProfile } from '../auth/types/auth.types';
import { TechnologiesService } from './technologies.service';
import {
  CreateTechnologyDto,
  UpdateTechnologyDto,
  TechnologyQueryDto,
  TechnologyResponseDto,
  BulkCreateTechnologiesDto,
  TechnologiesListEnvelopeDto,
  SingleTechnologyResponseDto,
  BulkCreateTechnologiesResponseDto,
} from './dto/technologies.dto';

@ApiTags('technologies')
@Controller('technologies')
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new technology (Admin only)',
    description:
      'Creates a new technology with unique label and value. Only admins can create technologies.',
  })
  @ApiCreatedResponse({
    description: 'Technology created successfully',
    type: SingleTechnologyResponseDto,
  })
  async create(
    @CurrentUser() user: UserProfile,
    @Body() dto: CreateTechnologyDto,
  ): Promise<SingleTechnologyResponseDto> {
    const technology = await this.technologiesService.create(user, dto);
    return {
      data: technology,
      status: 'success',
      message: 'Technology created successfully',
    };
  }

  @Post('bulk')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create multiple technologies at once (Admin only)',
    description:
      'Creates multiple technologies in a single request. Only admins can perform bulk operations.',
  })
  @ApiCreatedResponse({
    description: 'Technologies created successfully',
    type: BulkCreateTechnologiesResponseDto,
  })
  async bulkCreate(
    @CurrentUser() user: UserProfile,
    @Body() dto: BulkCreateTechnologiesDto,
  ): Promise<BulkCreateTechnologiesResponseDto> {
    const technologies = await this.technologiesService.bulkCreate(user, dto);
    return {
      data: technologies,
      status: 'success',
      message: `Successfully created ${technologies.length} technologies`,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update an existing technology (Admin only)',
    description:
      'Updates a technology by ID. Only admins can update technologies.',
  })
  @ApiParam({
    name: 'id',
    description: 'Technology unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Technology updated successfully',
    type: SingleTechnologyResponseDto,
  })
  async update(
    @CurrentUser() user: UserProfile,
    @Param('id') id: string,
    @Body() dto: UpdateTechnologyDto,
  ): Promise<SingleTechnologyResponseDto> {
    const technology = await this.technologiesService.update(user, id, dto);
    return {
      data: technology,
      status: 'success',
      message: 'Technology updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a technology (Admin only)',
    description:
      'Deletes a technology by ID. Cannot delete if technology is used in projects. Only admins can delete technologies.',
  })
  @ApiParam({
    name: 'id',
    description: 'Technology unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: UserProfile,
    @Param('id') id: string,
  ): Promise<void> {
    await this.technologiesService.delete(user, id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all technologies (Public access)',
    description:
      'Retrieves a paginated list of all technologies. No authentication required.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size',
    example: 10,
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query for label or value',
    example: 'react',
  })
  @ApiOkResponse({
    description: 'Technologies retrieved successfully',
    type: TechnologiesListEnvelopeDto,
  })
  async findAll(
    @Query() query: TechnologyQueryDto,
  ): Promise<TechnologiesListEnvelopeDto> {
    const result = await this.technologiesService.findAll(query);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const total = result.total;
    const totalPages = Math.ceil(total / (limit || 1)) || 1;
    const next = page < totalPages;
    const prev = page > 1;

    return {
      data: {
        data: result.data,
        total,
        page,
        limit,
        next,
        prev,
      },
      status: 'success',
      message: 'Technologies retrieved successfully',
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all technologies without pagination (Public access)',
    description:
      'Retrieves all technologies in a simple array format. Useful for dropdowns and autocomplete.',
  })
  @ApiOkResponse({
    description: 'All technologies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async getAllTechnologies(): Promise<{
    data: TechnologyResponseDto[];
    status: string;
    message: string;
  }> {
    const technologies = await this.technologiesService.getAllTechnologies();
    return {
      data: technologies,
      status: 'success',
      message: 'All technologies retrieved successfully',
    };
  }

  @Get('for-projects')
  @ApiOperation({
    summary: 'Get technology values for project creation (Public access)',
    description:
      'Retrieves only the technology values (not labels) for use in project creation forms.',
  })
  @ApiOkResponse({
    description: 'Technology values retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'string' },
        },
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async getTechnologiesForProjects(): Promise<{
    data: string[];
    status: string;
    message: string;
  }> {
    const technologies =
      await this.technologiesService.getTechnologiesForProjects();
    return {
      data: technologies,
      status: 'success',
      message: 'Technology values retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get technology by ID (Public access)',
    description: 'Retrieves a specific technology by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Technology unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Technology retrieved successfully',
    type: SingleTechnologyResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<SingleTechnologyResponseDto> {
    const technology = await this.technologiesService.findOne(id);
    if (!technology) {
      throw new Error('Technology not found');
    }
    return {
      data: technology,
      status: 'success',
      message: 'Technology retrieved successfully',
    };
  }

  @Get('by-value/:value')
  @ApiOperation({
    summary: 'Get technology by value (Public access)',
    description:
      'Retrieves a technology by its value (slug). Useful for URL-based lookups.',
  })
  @ApiParam({
    name: 'value',
    description: 'Technology value (slug)',
    example: 'react',
  })
  @ApiOkResponse({
    description: 'Technology retrieved successfully',
    type: SingleTechnologyResponseDto,
  })
  async findByValue(
    @Param('value') value: string,
  ): Promise<SingleTechnologyResponseDto> {
    const technology = await this.technologiesService.findByValue(value);
    if (!technology) {
      throw new Error('Technology not found');
    }
    return {
      data: technology,
      status: 'success',
      message: 'Technology retrieved successfully',
    };
  }
}
