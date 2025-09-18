import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getHealth() {
    try {
      const startTime = Date.now();

      // Basic health information
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected',
        memory: this.getMemoryUsage(),
      };

      // Test database connection
      try {
        await this.testDatabaseConnection();
        this.logger.log('Health check passed');
      } catch (error) {
        this.logger.error(`Health check failed: ${error.message}`);
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
          error: error.message,
        };
      }

      const responseTime = Date.now() - startTime;
      this.logger.log(`Health check completed in ${responseTime}ms`);

      return {
        ...health,
        responseTime: `${responseTime}ms`,
      };
    } catch (error: any) {
      this.logger.error(`Health check error: ${error.message}`);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        error: error.message,
      };
    }
  }

  private async testDatabaseConnection() {
    try {
      // Test with a simple query
      const { error } = await this.supabaseService.supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }
    } catch (error: any) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
  }

  private getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      used: `${Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100} MB`,
      free: `${Math.round(((usage.heapTotal - usage.heapUsed) / 1024 / 1024) * 100) / 100} MB`,
      total: `${Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100} MB`,
    };
  }
}
