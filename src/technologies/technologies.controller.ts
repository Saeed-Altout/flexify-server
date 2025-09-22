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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/types/auth.types';
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
  constructor(
    private readonly technologiesService: TechnologiesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create Technology',
    description: 'Create a new technology with icon (Admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Technology name',
          example: 'React',
        },
        description: {
          type: 'string',
          description: 'Technology description',
          example: 'A JavaScript library for building user interfaces',
        },
        category: {
          type: 'string',
          enum: [
            'Frontend',
            'Backend',
            'Database',
            'DevOps',
            'Mobile',
            'Desktop',
            'Cloud',
            'AI/ML',
            'Other',
          ],
          description: 'Technology category',
          example: 'Frontend',
        },
        is_active: {
          type: 'boolean',
          description: 'Whether the technology is active',
          example: true,
        },
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Technology icon file (image)',
        },
      },
      required: ['name', 'category'],
    },
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
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
        ],
        fileIsRequired: false, // Icon is optional
      }),
    )
    icon?: Express.Multer.File,
  ): Promise<StandardResponseDto<TechnologyDto>> {
    // Create the technology first
    const technology =
      await this.technologiesService.createTechnology(createDto);

    // If icon is provided, upload it and update the technology
    if (icon && technology.data) {
      try {
        const uploadResult = await this.fileUploadService.uploadTechnologyIcon(
          icon,
          technology.data.id,
        );

        // Update technology with icon information
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
        // If icon upload fails, still return the created technology
        // but log the error
        console.error('Icon upload failed:', error);
        return technology;
      }
    }

    return technology;
  }

  @Post(':id/icon')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload Technology Icon',
    description: 'Upload an icon for a technology (Admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Technology icon file (image)',
        },
      },
      required: ['icon'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Icon uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/TechnologyDto' },
        message: { type: 'string', example: 'Icon uploaded successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or technology not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Technology not found',
  })
  async uploadTechnologyIcon(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<TechnologyDto>> {
    // Check if technology exists
    const existingTech = await this.technologiesService.getTechnologyById(id);
    if (!existingTech.data) {
      throw new Error('Technology not found');
    }

    // Upload the icon
    const uploadResult = await this.fileUploadService.uploadTechnologyIcon(
      file,
      id,
    );

    // Update technology with icon information
    const updateData = {
      icon_url: uploadResult.url,
      icon_filename: uploadResult.filename,
      icon_size: file.size,
    };

    return this.technologiesService.updateTechnology(id, updateData);
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
    @CurrentUser() user: User,
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
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<null>> {
    return this.technologiesService.deleteTechnology(id);
  }
}
