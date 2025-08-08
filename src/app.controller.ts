import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get API information',
    description:
      'Returns information about the Flexify Auth Service API including available endpoints and documentation links.',
  })
  @ApiOkResponse({
    description: 'API information retrieved successfully',
    examples: {
      success: {
        summary: 'API information',
        value: {
          message: 'Flexify Auth Service API',
          version: '1.0.0',
          endpoints: [
            'POST /api/v1/auth/register - Register a new user',
            'POST /api/v1/auth/login - User login',
            'POST /api/v1/auth/logout - User logout',
            'GET /api/v1/auth/me - Get current user',
            'GET /api/v1/auth/verify - Verify authentication',
            'POST /api/v1/auth/refresh - Refresh token',
            'GET /api/v1/health - Health check',
          ],
          documentation: 'Visit /api/v1 for API documentation',
        },
      },
    },
  })
  getApiInfo(): {
    message: string;
    version: string;
    endpoints: string[];
    documentation: string;
  } {
    return {
      message: 'Flexify Auth Service API',
      version: '1.0.0',
      endpoints: [
        'POST /api/v1/auth/register - Register a new user',
        'POST /api/v1/auth/login - User login',
        'POST /api/v1/auth/logout - User logout',
        'GET /api/v1/auth/me - Get current user',
        'GET /api/v1/auth/verify - Verify authentication',
        'POST /api/v1/auth/refresh - Refresh token',
        'GET /api/v1/health - Health check',
      ],
      documentation: 'Visit /api/v1 for API documentation',
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the service.',
  })
  @ApiOkResponse({
    description: 'Service is healthy',
    examples: {
      success: {
        summary: 'Health check successful',
        value: {
          status: 'ok',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      },
    },
  })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
