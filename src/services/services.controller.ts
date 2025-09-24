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

import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

import { ServicesService } from './services.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceQueryDto,
} from './dto/services.dto';
import type { RootResponse } from '../common/types';
import type { ServicesResponse, Service } from './types/services.types';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Service',
    description: 'Create a new service (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Service' },
        message: { type: 'string', example: 'Service created successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
  })
  async createService(
    @Body() createDto: CreateServiceDto,
  ): Promise<RootResponse<Service>> {
    return this.servicesService.createService(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get All Services',
    description: 'Get a paginated list of all services with optional filtering',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for name or description',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Sort by field',
    enum: ['name', 'is_active', 'created_at', 'updated_at'],
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ServicesResponse' },
        message: { type: 'string', example: 'Services retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async getServices(
    @Query() query: ServiceQueryDto,
  ): Promise<RootResponse<ServicesResponse>> {
    return this.servicesService.getServices(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Service by ID',
    description: 'Get a specific service by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Service retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Service' },
        message: { type: 'string', example: 'Service retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async getServiceById(
    @Param('id') id: string,
  ): Promise<RootResponse<Service>> {
    return this.servicesService.getServiceById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Service',
    description: 'Update a service by ID (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Service' },
        message: { type: 'string', example: 'Service updated successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
  })
  async updateService(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceDto,
  ): Promise<RootResponse<Service>> {
    return this.servicesService.updateService(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Service',
    description: 'Delete a service by ID (Admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Failed to delete service',
  })
  async deleteService(@Param('id') id: string): Promise<RootResponse<null>> {
    return this.servicesService.deleteService(id);
  }
}
