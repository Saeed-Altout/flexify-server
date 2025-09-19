import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppearanceService } from './appearance.service';
import {
  UpdateAppearanceDto,
  AppearanceSettingsDto,
  StandardResponseDto,
} from './dto/appearance.dto';
import { AppearanceSettings } from './types/appearance.types';
import type { User } from '../auth/types/auth.types';

@ApiTags('Appearance')
@Controller('appearance')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AppearanceController {
  constructor(private readonly appearanceService: AppearanceService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Get Appearance Settings',
    description:
      'Get current user appearance settings (theme, timezone, language, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Appearance settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/AppearanceSettingsDto' },
        message: {
          type: 'string',
          example: 'Appearance settings retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getAppearanceSettings(
    @Request() req: { user: User },
  ): Promise<StandardResponseDto<AppearanceSettings>> {
    return this.appearanceService.getAppearanceSettings(req.user.id);
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Appearance Settings',
    description:
      'Update user appearance settings (theme, timezone, language, etc.)',
  })
  @ApiBody({ type: UpdateAppearanceDto })
  @ApiResponse({
    status: 200,
    description: 'Appearance settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/AppearanceSettingsDto' },
        message: {
          type: 'string',
          example: 'Appearance settings updated successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation failed',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: {
          type: 'string',
          examples: [
            'Invalid timezone. Must be one of: UTC, America/New_York, ...',
            'Validation failed',
          ],
        },
        status: { type: 'string', example: 'error' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateAppearanceSettings(
    @Request() req: { user: User },
    @Body() updateAppearanceDto: UpdateAppearanceDto,
  ): Promise<StandardResponseDto<AppearanceSettings>> {
    return this.appearanceService.updateAppearanceSettings(
      req.user.id,
      updateAppearanceDto,
    );
  }

  @Post('settings/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset Appearance Settings',
    description: 'Reset user appearance settings to default values',
  })
  @ApiResponse({
    status: 200,
    description: 'Appearance settings reset successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/AppearanceSettingsDto' },
        message: {
          type: 'string',
          example: 'Appearance settings reset to defaults successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resetAppearanceSettings(
    @Request() req: { user: User },
  ): Promise<StandardResponseDto<AppearanceSettings>> {
    return this.appearanceService.resetAppearanceSettings(req.user.id);
  }

  @Get('options')
  @ApiOperation({
    summary: 'Get Appearance Options',
    description:
      'Get available options for appearance settings (themes, timezones, languages, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Appearance options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            themes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string', example: 'dark' },
                  label: { type: 'string', example: 'Dark' },
                },
              },
            },
            timezones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string', example: 'America/New_York' },
                  label: {
                    type: 'string',
                    example: 'America/New_York (EST/EDT)',
                  },
                },
              },
            },
            timeFormats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string', example: '12' },
                  label: { type: 'string', example: '12-hour (AM/PM)' },
                },
              },
            },
            languages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string', example: 'en' },
                  label: { type: 'string', example: 'English' },
                },
              },
            },
            dateFormats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string', example: 'MM/DD/YYYY' },
                  label: { type: 'string', example: 'MM/DD/YYYY' },
                },
              },
            },
          },
        },
        message: {
          type: 'string',
          example: 'Appearance options retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAppearanceOptions(): Promise<
    StandardResponseDto<{
      themes: Array<{ value: string; label: string }>;
      timezones: Array<{ value: string; label: string }>;
      timeFormats: Array<{ value: string; label: string }>;
      languages: Array<{ value: string; label: string }>;
      dateFormats: Array<{ value: string; label: string }>;
    }>
  > {
    return this.appearanceService.getAppearanceOptions();
  }
}
