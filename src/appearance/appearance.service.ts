import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  UpdateAppearanceRequest,
  AppearanceSettings,
} from './types/appearance.types';
import { StandardResponseDto } from './dto/appearance.dto';

@Injectable()
export class AppearanceService {
  private readonly logger = new Logger(AppearanceService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAppearanceSettings(
    userId: string,
  ): Promise<StandardResponseDto<AppearanceSettings>> {
    try {
      this.logger.log(`Getting appearance settings for user: ${userId}`);

      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Return appearance settings with defaults if not set
      const appearanceSettings: AppearanceSettings = {
        theme: (user.theme as any) || 'system',
        timezone: user.timezone || 'UTC',
        time_format: (user.time_format as any) || '12',
        language: (user.language as any) || 'en',
        date_format: (user.date_format as any) || 'MM/DD/YYYY',
      };

      this.logger.log(
        `Successfully retrieved appearance settings for user: ${userId}`,
      );

      return {
        data: appearanceSettings,
        message: 'Appearance settings retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getAppearanceSettings: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateAppearanceSettings(
    userId: string,
    updateAppearanceDto: UpdateAppearanceRequest,
  ): Promise<StandardResponseDto<AppearanceSettings>> {
    try {
      this.logger.log(`Updating appearance settings for user: ${userId}`);

      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Validate timezone if provided
      if (updateAppearanceDto.timezone) {
        this.validateTimezone(updateAppearanceDto.timezone);
      }

      // Update user appearance settings
      const updatedUser = await this.supabaseService.updateUser(userId, {
        ...updateAppearanceDto,
        updated_at: new Date().toISOString(),
      });

      if (!updatedUser) {
        throw new BadRequestException('Failed to update appearance settings');
      }

      // Return updated appearance settings
      const appearanceSettings: AppearanceSettings = {
        theme: (updatedUser.theme as any) || 'system',
        timezone: updatedUser.timezone || 'UTC',
        time_format: (updatedUser.time_format as any) || '12',
        language: (updatedUser.language as any) || 'en',
        date_format: (updatedUser.date_format as any) || 'MM/DD/YYYY',
      };

      this.logger.log(
        `Successfully updated appearance settings for user: ${userId}`,
      );

      return {
        data: appearanceSettings,
        message: 'Appearance settings updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateAppearanceSettings: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async resetAppearanceSettings(
    userId: string,
  ): Promise<StandardResponseDto<AppearanceSettings>> {
    try {
      this.logger.log(`Resetting appearance settings for user: ${userId}`);

      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Reset to default values
      const defaultSettings = {
        theme: 'system',
        timezone: 'UTC',
        time_format: '12',
        language: 'en',
        date_format: 'MM/DD/YYYY',
        updated_at: new Date().toISOString(),
      };

      const updatedUser = await this.supabaseService.updateUser(
        userId,
        defaultSettings,
      );

      if (!updatedUser) {
        throw new BadRequestException('Failed to reset appearance settings');
      }

      const appearanceSettings: AppearanceSettings = {
        theme: 'system',
        timezone: 'UTC',
        time_format: '12',
        language: 'en',
        date_format: 'MM/DD/YYYY',
      };

      this.logger.log(
        `Successfully reset appearance settings for user: ${userId}`,
      );

      return {
        data: appearanceSettings,
        message: 'Appearance settings reset to defaults successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in resetAppearanceSettings: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  private validateTimezone(timezone: string): void {
    // Basic timezone validation - check if it's a valid IANA timezone
    const validTimezones = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
    ];

    if (!validTimezones.includes(timezone)) {
      throw new BadRequestException(
        `Invalid timezone. Must be one of: ${validTimezones.join(', ')}`,
      );
    }
  }

  // Helper method to get available options for frontend
  async getAppearanceOptions(): Promise<
    StandardResponseDto<{
      themes: Array<{ value: string; label: string }>;
      timezones: Array<{ value: string; label: string }>;
      timeFormats: Array<{ value: string; label: string }>;
      languages: Array<{ value: string; label: string }>;
      dateFormats: Array<{ value: string; label: string }>;
    }>
  > {
    try {
      const options = {
        themes: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ],
        timezones: [
          { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
          { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
          { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
          { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
          {
            value: 'America/Los_Angeles',
            label: 'America/Los_Angeles (PST/PDT)',
          },
          { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
          { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
          { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
          { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
          { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
          { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
          { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
        ],
        timeFormats: [
          { value: '12', label: '12-hour (AM/PM)' },
          { value: '24', label: '24-hour' },
        ],
        languages: [
          { value: 'en', label: 'English' },
          { value: 'ar', label: 'Arabic' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' },
          { value: 'it', label: 'Italiano' },
          { value: 'pt', label: 'Português' },
          { value: 'ru', label: 'Русский' },
          { value: 'zh', label: '中文' },
          { value: 'ja', label: '日本語' },
          { value: 'ko', label: '한국어' },
        ],
        dateFormats: [
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
          { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
          { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
        ],
      };

      return {
        data: options,
        message: 'Appearance options retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getAppearanceOptions: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
