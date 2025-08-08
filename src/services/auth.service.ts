import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { UserProfile, AuthResponse } from '../types/auth.types';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      this.logger.log(
        `Attempting to register user with email: ${registerDto.email}`,
      );

      // Check if user already exists
      const existingUser = await this.supabaseService.getUserByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create user in Supabase
      const user = await this.supabaseService.createUser(
        registerDto.email,
        registerDto.name,
        registerDto.password,
      );

      this.logger.log(`Successfully registered user: ${user.id}`);

      return {
        user,
        message: 'User registered successfully',
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting to login user with email: ${loginDto.email}`);

      const authResponse = await this.supabaseService.signInUser(
        loginDto.email,
        loginDto.password,
      );

      this.logger.log(`Successfully logged in user: ${authResponse.user.id}`);

      return authResponse;
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      this.logger.log('Attempting to logout user');

      await this.supabaseService.signOutUser(token);

      this.logger.log('Successfully logged out user');

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`);
      throw error;
    }
  }

  async getCurrentUser(token: string): Promise<UserProfile> {
    try {
      const user = await this.supabaseService.verifySession(token);
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      return user;
    } catch (error) {
      this.logger.error(`Get current user failed: ${error.message}`);
      throw error;
    }
  }

  async validateToken(token: string): Promise<UserProfile | null> {
    try {
      return await this.supabaseService.verifySession(token);
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      return null;
    }
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      // For Supabase, we'll need to implement token refresh logic
      // This is a placeholder implementation
      const user = await this.supabaseService.verifySession(token);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        user,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw error;
    }
  }
}
