import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Session, UserRole } from '../auth/types/auth.types';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public supabase: SupabaseClient;
  private isDevelopmentMode = false;
  private jwtSecret: string;
  private jwtRefreshSecret: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseServiceKey = this.configService.get<string>(
      'supabase.serviceKey',
    );
    this.jwtSecret =
      this.configService.get<string>('jwt.secret') || 'your-secret-key';
    this.jwtRefreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ||
      'your-refresh-secret-key';

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.warn(
        'Supabase configuration is missing. Running in development mode.',
      );
      this.isDevelopmentMode = true;
      this.supabase = createClient(
        supabaseUrl || 'https://dummy.supabase.co',
        supabaseServiceKey || 'dummy-key',
      );
    } else {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  // =====================================================
  // USER OPERATIONS
  // =====================================================

  async createUser(
    email: string,
    name: string,
    password: string,
  ): Promise<User> {
    try {
      if (this.isDevelopmentMode) {
        this.logger.warn(
          'Running in development mode with dummy Supabase config',
        );
        return {
          id: 'dev-user-id',
          email,
          name,
          password_hash: 'dev-hash',
          role: 'USER',
          is_active: true,
          email_verified: false,
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
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          email,
          name,
          password_hash: passwordHash,
          role: 'USER',
          is_active: true,
          email_verified: false,
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
      return data;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in createUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (this.isDevelopmentMode) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error: any) {
      this.logger.error(`Error in getUserByEmail: ${error.message}`);
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      if (this.isDevelopmentMode) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error: any) {
      this.logger.error(`Error in getUserById: ${error.message}`);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      if (this.isDevelopmentMode) {
        this.logger.warn('Running in development mode');
        return {
          id,
          email: 'dev@example.com',
          name: 'Dev User',
          password_hash: 'dev-hash',
          role: 'USER',
          is_active: true,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating user: ${error.message}`);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      if (!data) {
        throw new Error('User not found');
      }

      return data;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error: any) {
      this.logger.error(`Error verifying password: ${error.message}`);
      return false;
    }
  }

  // =====================================================
  // SESSION OPERATIONS
  // =====================================================

  async createSession(
    userId: string,
    tokenHash: string,
    expiresAt: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Session> {
    try {
      if (this.isDevelopmentMode) {
        this.logger.warn('Running in development mode');
        return {
          id: 'dev-session-id',
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt,
          is_active: true,
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const { data, error } = await this.supabase
        .from('sessions')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt,
          is_active: true,
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Error creating session: ${error.message}`);
        throw new Error(`Failed to create session: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create session');
      }

      return data;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in createSession: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    try {
      if (this.isDevelopmentMode) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('token_hash', tokenHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error: any) {
      this.logger.error(`Error in getSessionByTokenHash: ${error.message}`);
      return null;
    }
  }

  async invalidateSession(sessionId: string): Promise<void> {
    try {
      if (this.isDevelopmentMode) {
        return;
      }

      const { error } = await this.supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) {
        this.logger.error(`Error invalidating session: ${error.message}`);
        throw new Error(`Failed to invalidate session: ${error.message}`);
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in invalidateSession: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      if (this.isDevelopmentMode) {
        return;
      }

      const { error } = await this.supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) {
        this.logger.error(`Error invalidating user sessions: ${error.message}`);
        throw new Error(`Failed to invalidate user sessions: ${error.message}`);
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in invalidateUserSessions: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async cleanExpiredSessions(): Promise<void> {
    try {
      if (this.isDevelopmentMode) {
        return;
      }

      const { error } = await this.supabase.rpc('clean_expired_sessions');
      if (error) {
        this.logger.error(`Error cleaning expired sessions: ${error.message}`);
      }
    } catch (error: any) {
      this.logger.error(`Error in cleanExpiredSessions: ${error.message}`);
    }
  }

  // =====================================================
  // JWT OPERATIONS
  // =====================================================

  generateAccessToken(payload: any): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '30d' });
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: '7d' });
  }

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtRefreshSecret);
    } catch (error) {
      return null;
    }
  }

  generateTokenHash(token: string): string {
    return require('crypto').createHash('sha256').update(token).digest('hex');
  }

  // =====================================================
  // GENERAL DATABASE OPERATIONS
  // =====================================================

  async insert(table: string, data: Record<string, any>) {
    if (this.isDevelopmentMode) {
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
    if (this.isDevelopmentMode) {
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
    if (this.isDevelopmentMode) {
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
    if (this.isDevelopmentMode) {
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
