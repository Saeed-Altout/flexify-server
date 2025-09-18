import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get welcome message',
    description: 'Returns a simple welcome message from the Flexify API',
  })
  @ApiOkResponse({
    description: 'Welcome message retrieved successfully',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the current health status and timestamp of the API',
  })
  @ApiOkResponse({
    description: 'Health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'healthy',
          description: 'Current health status of the API',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
          description: 'ISO timestamp of the health check',
        },
      },
    },
  })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('cors-test')
  @ApiOperation({
    summary: 'CORS test endpoint',
    description: 'Tests CORS functionality and returns CORS headers information',
  })
  @ApiOkResponse({
    description: 'CORS test completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'CORS test successful',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        cors: {
          type: 'object',
          properties: {
            origin: {
              type: 'string',
              description: 'Access-Control-Allow-Origin header value',
            },
            credentials: {
              type: 'string',
              description: 'Access-Control-Allow-Credentials header value',
            },
            methods: {
              type: 'string',
              description: 'Access-Control-Allow-Methods header value',
            },
            headers: {
              type: 'string',
              description: 'Access-Control-Allow-Headers header value',
            },
          },
        },
      },
    },
  })
  testCors(@Res() res: Response): void {
    // This endpoint specifically tests CORS functionality
    res.status(HttpStatus.OK).json({
      message: 'CORS test successful',
      timestamp: new Date().toISOString(),
      cors: {
        origin: res.getHeader('Access-Control-Allow-Origin'),
        credentials: res.getHeader('Access-Control-Allow-Credentials'),
        methods: res.getHeader('Access-Control-Allow-Methods'),
        headers: res.getHeader('Access-Control-Allow-Headers'),
      },
    });
  }
}
