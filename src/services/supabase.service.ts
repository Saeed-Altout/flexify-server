import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, AuthResponse } from '../types/auth.types';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private isDevelopmentMode = false;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseServiceKey = this.configService.get<string>(
      'supabase.serviceKey',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.warn(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.',
      );
      this.logger.warn(
        'For development, you can use dummy values or create a .env file based on env.example',
      );

      // For development, create a dummy client to prevent crashes
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        this.logger.warn('Creating dummy Supabase client for development');
        this.isDevelopmentMode = true;
        this.supabase = createClient(
          supabaseUrl || 'https://dummy.supabase.co',
          supabaseServiceKey || 'dummy-key',
        );
      } else {
        throw new Error(
          'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.',
        );
      }
    } else {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  async createUser(
    email: string,
    name: string,
    password?: string,
  ): Promise<UserProfile> {
    try {
      // Check if we're in development mode with dummy config
      if (
        this.isDevelopmentMode ||
        !this.configService.get<string>('supabase.url')
      ) {
        this.logger.warn(
          'Running in development mode with dummy Supabase config',
        );
        // Return a mock user for development
        return {
          id: 'dev-user-id',
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const {
        data: { user },
        error,
      } = await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

      if (error) {
        this.logger.error(`Error creating user: ${error.message}`);

        // Handle specific Supabase errors
        if (error.message.includes('User not allowed')) {
          throw new Error(
            'Supabase configuration error: "User not allowed". Please check:\n' +
              '1. You are using the SERVICE_ROLE key (not anon key)\n' +
              '2. Your Supabase project is properly configured\n' +
              '3. RLS policies are set up correctly\n' +
              '4. See SUPABASE_SETUP.md for complete setup instructions',
          );
        }

        if (error.message.includes('Invalid API key')) {
          throw new Error(
            'Invalid Supabase API key. Please check:\n' +
              '1. SUPABASE_SERVICE_KEY is correct\n' +
              '2. SUPABASE_URL is correct\n' +
              '3. No extra spaces or characters in the keys',
          );
        }

        throw new Error(error.message);
      }

      if (!user) {
        throw new Error('Failed to create user');
      }

      return {
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string) || name,
        created_at: user.created_at,
        updated_at: user.updated_at!,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in createUser: ${errorMessage}`);
      throw error;
    }
  }

  async signInUser(email: string, password?: string): Promise<AuthResponse> {
    try {
      // Check if we're in development mode with dummy config
      if (
        this.isDevelopmentMode ||
        !this.configService.get<string>('supabase.url')
      ) {
        this.logger.warn(
          'Running in development mode with dummy Supabase config',
        );
        // Return a mock response for development
        return {
          user: {
            id: 'dev-user-id',
            email,
            name: 'Development User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          access_token: 'dev-token',
        };
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) {
        this.logger.error(`Error signing in user: ${error.message}`);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('User not found');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name as string | undefined,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at!,
        },
        session: data.session,
        access_token: data.session?.access_token,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in signInUser: ${errorMessage}`);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      // Check if we're in development mode with dummy config
      if (
        this.isDevelopmentMode ||
        !this.configService.get<string>('supabase.url')
      ) {
        this.logger.warn(
          'Running in development mode with dummy Supabase config',
        );
        return null;
      }

      const {
        data: { user },
        error,
      } = await this.supabase.auth.admin.getUserById(userId);

      if (error) {
        this.logger.error(`Error getting user: ${error.message}`);
        return null;
      }

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name as string | undefined,
        created_at: user.created_at,
        updated_at: user.updated_at!,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in getUserById: ${errorMessage}`);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      // Check if we're in development mode with dummy config
      if (
        this.isDevelopmentMode ||
        !this.configService.get<string>('supabase.url')
      ) {
        this.logger.warn(
          'Running in development mode with dummy Supabase config',
        );
        return null;
      }

      const {
        data: { users },
        error,
      } = await this.supabase.auth.admin.listUsers();

      if (error) {
        this.logger.error(`Error listing users: ${error.message}`);
        return null;
      }

      const user = users.find((u) => u.email === email);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name as string | undefined,
        created_at: user.created_at,
        updated_at: user.updated_at!,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in getUserByEmail: ${errorMessage}`);
      return null;
    }
  }

  async signOutUser(sessionToken: string): Promise<void> {
    try {
      // Check if we're in development mode with dummy config
      if (
        this.isDevelopmentMode ||
        !this.configService.get<string>('supabase.url')
      ) {
        this.logger.warn(
          'Running in development mode with dummy Supabase config',
        );
        return;
      }

      const { error } = await this.supabase.auth.admin.signOut(sessionToken);
      if (error) {
        this.logger.error(`Error signing out user: ${error.message}`);
        throw new Error(error.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in signOutUser: ${errorMessage}`);
      throw error;
    }
  }

  async verifySession(sessionToken: string): Promise<UserProfile | null> {
    try {
      // Check if we're in development mode with dummy config
      if (
        this.isDevelopmentMode ||
        !this.configService.get<string>('supabase.url')
      ) {
        this.logger.warn(
          'Running in development mode with dummy Supabase config',
        );
        // Return a mock user for development if token looks valid
        if (sessionToken && sessionToken !== 'invalid') {
          return {
            id: 'dev-user-id',
            email: 'dev@example.com',
            name: 'Development User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return null;
      }

      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(sessionToken);

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name as string | undefined,
        created_at: user.created_at,
        updated_at: user.updated_at!,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in verifySession: ${errorMessage}`);
      return null;
    }
  }
}
