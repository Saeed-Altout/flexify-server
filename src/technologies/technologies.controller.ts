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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  CreateTechnologyDto,
  UpdateTechnologyDto,
  TechnologyQueryDto,
  TechnologyDto,
  TechnologyListResponseDto,
  StandardResponseDto,
} from './dto/technologies.dto';

@ApiTags('technologies')
@Controller('technologies')
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Technology',
    description: 'Create a new technology (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Technology created successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/TechnologyDto' },
        message: { type: 'string', example: 'Technology created successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or technology already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createTechnology(
    @Body() createDto: CreateTechnologyDto,
  ): Promise<StandardResponseDto<TechnologyDto>> {
    return this.technologiesService.createTechnology(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get Technologies',
    description: 'Get a paginated list of technologies with optional filtering',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Technologies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/TechnologyListResponseDto' },
        message: {
          type: 'string',
          example: 'Technologies retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getTechnologies(
    @Query() query: TechnologyQueryDto,
  ): Promise<StandardResponseDto<TechnologyListResponseDto>> {
    return this.technologiesService.getTechnologies(query);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get Active Technologies',
    description: 'Get all active technologies',
  })
  @ApiResponse({
    status: 200,
    description: 'Active technologies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TechnologyDto' },
        },
        message: {
          type: 'string',
          example: 'Active technologies retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getActiveTechnologies(): Promise<StandardResponseDto<TechnologyDto[]>> {
    return this.technologiesService.getActiveTechnologies();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search Technologies',
    description: 'Search technologies by name, description, or category',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TechnologyDto' },
        },
        message: {
          type: 'string',
          example: 'Search results retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async searchTechnologies(
    @Query('q') searchTerm: string,
  ): Promise<StandardResponseDto<TechnologyDto[]>> {
    return this.technologiesService.searchTechnologies(searchTerm);
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Get Technologies by Category',
    description: 'Get all active technologies in a specific category',
  })
  @ApiResponse({
    status: 200,
    description: 'Technologies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TechnologyDto' },
        },
        message: {
          type: 'string',
          example: 'Technologies retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getTechnologiesByCategory(
    @Param('category') category: string,
  ): Promise<StandardResponseDto<TechnologyDto[]>> {
    return this.technologiesService.getTechnologiesByCategory(category);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Technology by ID',
    description: 'Get a specific technology by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Technology retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/TechnologyDto' },
        message: {
          type: 'string',
          example: 'Technology retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Technology not found',
  })
  async getTechnologyById(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<TechnologyDto>> {
    return this.technologiesService.getTechnologyById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Technology',
    description: 'Update a technology (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Technology updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/TechnologyDto' },
        message: { type: 'string', example: 'Technology updated successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Technology not found',
  })
  async updateTechnology(
    @Param('id') id: string,
    @Body() updateDto: UpdateTechnologyDto,
  ): Promise<StandardResponseDto<TechnologyDto>> {
    return this.technologiesService.updateTechnology(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Technology',
    description: 'Delete a technology (Admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Technology deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Technology not found',
  })
  async deleteTechnology(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<null>> {
    return this.technologiesService.deleteTechnology(id);
  }
}
