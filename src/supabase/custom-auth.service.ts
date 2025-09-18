import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, AuthResponse, UserRole } from '../auth/types/auth.types';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CustomAuthService {
  private readonly logger = new Logger(CustomAuthService.name);
  private supabase: SupabaseClient;
  private isDevelopmentMode = false;
  private storageBucket: string;
  private jwtSecret: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseServiceKey = this.configService.get<string>(
      'supabase.serviceKey',
    );
    this.jwtSecret =
      this.configService.get<string>('jwt.secret') || 'your-secret-key';

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
    password: string,
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

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user in custom users table
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          email,
          name,
          password_hash: passwordHash,
          role: 'USER',
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Error creating user: ${error.message}`);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create user');
      }

      this.logger.log(`Successfully created user: ${data.id}`);

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar_url: data.avatar_url,
        role: data.role,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      this.logger.error(`Error in createUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async signInUser(email: string, password: string): Promise<AuthResponse> {
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

      // Get user from custom users table
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        this.logger.error(
          `Error finding user: ${error?.message || 'User not found'}`,
        );
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isPasswordValid) {
        this.logger.error('Invalid password for user');
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        this.jwtSecret,
        { expiresIn: '7d' },
      );

      this.logger.log(`Successfully signed in user: ${user.id}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        access_token: token,
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      this.logger.error(`Error in signInUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
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

      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        this.logger.error(
          `Error getting user: ${error?.message || 'User not found'}`,
        );
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
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

      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        this.logger.error(
          `Error getting user by email: ${error?.message || 'User not found'}`,
        );
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      this.logger.error(`Error in getUserByEmail: ${errorMessage}`);
      return null;
    }
  }

  async signOutUser(sessionToken: string): Promise<void> {
    try {
      // For custom auth, we don't need to do anything special for sign out
      // The client should just remove the token
      this.logger.log('User signed out successfully');
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      this.logger.error(`Error in signOutUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
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

      // Verify JWT token
      const decoded = jwt.verify(sessionToken, this.jwtSecret) as any;

      if (!decoded || !decoded.sub) {
        return null;
      }

      // Get user from database
      const user = await this.getUserById(decoded.sub);
      return user;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
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
      throw new Error(
        `Failed to upload file: ${typeof error.message === 'string' ? error.message : JSON.stringify(error)}`,
      );
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
