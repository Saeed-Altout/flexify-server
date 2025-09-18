import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProduces,
} from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Check server health status',
    description:
      'Returns the current health status of the Flexify server including uptime, environment, and version information. This endpoint is used for monitoring and health checks.',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Server is healthy and running',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Health status indicator',
        },
        timestamp: {
          type: 'string',
          example: '2023-01-01T00:00:00.000Z',
          description: 'Current server timestamp in ISO format',
        },
        uptime: {
          type: 'number',
          example: 123.456,
          description: 'Server uptime in seconds',
        },
        environment: {
          type: 'string',
          example: 'development',
          description: 'Current environment (development, production, etc.)',
        },
        version: {
          type: 'string',
          example: '2.0.0',
          description: 'API version number',
        },
      },
      required: ['status', 'timestamp', 'uptime', 'environment', 'version'],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Server is unhealthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Server is experiencing issues' },
        timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
      },
    },
  })
  check() {
    try {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '2.0.0',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Server is experiencing issues',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
