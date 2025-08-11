import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, AuthResponse, UserRole } from '../types/auth.types';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private isDevelopmentMode = false;
  private storageBucket: string;

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

    this.storageBucket =
      this.configService.get<string>('supabase.storageBucket') ||
      'project-assets';
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
          role: 'USER',
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
        user_metadata: { name, role: 'USER' },
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

      const profile = await this.fetchUserProfile(user.id);
      return {
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string) || name,
        role: profile?.role || (user.user_metadata?.role as UserRole) || 'USER',
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
            role: 'USER',
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

      const profile = await this.fetchUserProfile(data.user.id);
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name:
            (data.user.user_metadata?.name as string | undefined) ??
            profile?.name,
          role:
            (profile?.role || (data.user.user_metadata?.role as UserRole)) ??
            'USER',
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

      const profile = await this.fetchUserProfile(user.id);
      return {
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string | undefined) ?? profile?.name,
        role: profile?.role || (user.user_metadata?.role as UserRole) || 'USER',
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

      const profile = await this.fetchUserProfile(user.id);
      return {
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string | undefined) ?? profile?.name,
        role: profile?.role || (user.user_metadata?.role as UserRole) || 'USER',
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
            role: 'USER',
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

      const profile = await this.fetchUserProfile(user.id);
      return {
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string | undefined) ?? profile?.name,
        role: profile?.role || (user.user_metadata?.role as UserRole) || 'USER',
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

  /**
   * Uploads a file buffer to Supabase Storage and returns a public URL if available
   */
  async uploadPublicAsset(
    path: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    // In development dummy mode, return a mock URL
    if (
      this.isDevelopmentMode ||
      !this.configService.get<string>('supabase.url')
    ) {
      this.logger.warn(
        'uploadPublicAsset called in development mode. Returning mock URL.',
      );
      return `https://dummy.supabase.co/storage/v1/object/public/${this.storageBucket}/${encodeURIComponent(
        path,
      )}`;
    }

    const { error } = await this.supabase.storage
      .from(this.storageBucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });
    if (error) {
      this.logger.error(`Storage upload error: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from(this.storageBucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /** Deletes a file from storage; best-effort */
  async deleteAsset(path: string): Promise<void> {
    if (
      this.isDevelopmentMode ||
      !this.configService.get<string>('supabase.url')
    ) {
      return;
    }
    const { error } = await this.supabase.storage
      .from(this.storageBucket)
      .remove([path]);
    if (error) {
      this.logger.warn(`Failed to delete asset ${path}: ${error.message}`);
    }
  }
  // Fetch minimal user profile (name and role) from public.user_profiles
  // Returns null if not found or on error
  private async fetchUserProfile(
    userId: string,
  ): Promise<{ name?: string; role: UserRole } | null> {
    try {
      if (
        this.isDevelopmentMode ||
        !this.configService.get<string>('supabase.url')
      ) {
        return { name: 'Development User', role: 'USER' };
      }
      const { data, error } = await (this.supabase as any)
        .from('user_profiles')
        .select('name, role')
        .eq('id', userId)
        .single();
      if (error) {
        this.logger.warn(`fetchUserProfile error: ${error.message}`);
        return null;
      }
      return {
        name: data?.name ?? undefined,
        role: (data?.role as UserRole) ?? 'USER',
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`fetchUserProfile exception: ${msg}`);
      return null;
    }
  }

  // Public methods for database operations
  async insert(table: string, data: Record<string, any>) {
    if (
      this.isDevelopmentMode ||
      !this.configService.get<string>('supabase.url')
    ) {
      this.logger.warn(`insert called in development mode for table: ${table}`);
      return { data: { id: 'dev-id', ...data }, error: null };
    }
    return await this.supabase.from(table).insert(data).select().single();
  }

  async select(
    table: string,
    query?: {
      eq?: Record<string, any>;
      order?: { column: string; options: any };
    },
  ) {
    if (
      this.isDevelopmentMode ||
      !this.configService.get<string>('supabase.url')
    ) {
      this.logger.warn(`select called in development mode for table: ${table}`);
      return { data: [], error: null };
    }

    let queryBuilder = this.supabase.from(table).select('*');

    if (query) {
      if (query.eq) {
        Object.entries(query.eq).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      if (query.order) {
        queryBuilder = queryBuilder.order(
          query.order.column,
          query.order.options,
        );
      }
    }

    return await queryBuilder;
  }

  async update(
    table: string,
    data: Record<string, any>,
    eq: Record<string, any>,
  ) {
    if (
      this.isDevelopmentMode ||
      !this.configService.get<string>('supabase.url')
    ) {
      this.logger.warn(`update called in development mode for table: ${table}`);
      return { data: { id: 'dev-id', ...data }, error: null };
    }

    let queryBuilder = this.supabase.from(table).update(data);

    if (eq) {
      Object.entries(eq).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    return await queryBuilder.select().single();
  }

  async delete(table: string, eq: Record<string, any>) {
    if (
      this.isDevelopmentMode ||
      !this.configService.get<string>('supabase.url')
    ) {
      this.logger.warn(`delete called in development mode for table: ${table}`);
      return { error: null };
    }

    let queryBuilder = this.supabase.from(table).delete();

    if (eq) {
      Object.entries(eq).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    return await queryBuilder;
  }
}
