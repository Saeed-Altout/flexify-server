import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import {
  User,
  Session,
  AuthResponse,
  SignUpRequest,
  SignInRequest,
  SignOutRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from './types/auth.types';
import { StandardResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================

  async signUp(
    signUpDto: SignUpRequest,
  ): Promise<StandardResponseDto<Omit<User, 'password_hash'>>> {
    try {
      this.logger.log(
        `Attempting to sign up user with email: ${signUpDto.email}`,
      );

      // Check if user already exists
      const existingUser = await this.supabaseService.getUserByEmail(
        signUpDto.email,
      );
      if (existingUser) {
        throw new ConflictException('User already exists with this email');
      }

      // Create user
      const user = await this.supabaseService.createUser(
        signUpDto.email,
        signUpDto.name,
        signUpDto.password,
      );

      this.logger.log(`Successfully signed up user: ${user.id}`);

      // Return user without password
      const { password_hash, ...userWithoutPassword } = user;

      return {
        data: userWithoutPassword,
        message: 'User signed up successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in signUp: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async signIn(
    signInDto: SignInRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<StandardResponseDto<AuthResponse>> {
    try {
      this.logger.log(
        `Attempting to sign in user with email: ${signInDto.email}`,
      );

      // Get user by email
      const user = await this.supabaseService.getUserByEmail(signInDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await this.supabaseService.verifyPassword(
        signInDto.password,
        user.password_hash,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate access token
      const accessToken = this.supabaseService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Create session with access token
      const tokenHash = this.supabaseService.generateTokenHash(accessToken);
      const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000, // 15 minutes
      ).toISOString();

      await this.supabaseService.createSession(
        user.id,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      );

      // Update last login
      await this.supabaseService.updateUser(user.id, {
        last_login_at: new Date().toISOString(),
      });

      this.logger.log(`Successfully signed in user: ${user.id}`);

      // Return user without password
      const { password_hash, ...userWithoutPassword } = user;

      return {
        data: {
          user: userWithoutPassword,
          access_token: accessToken,
          session: {
            isActive: true,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            ipAddress,
            userAgent,
          },
        },
        message: 'User signed in successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in signIn: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async signOut(
    signOutDto: SignOutRequest,
    userId?: string,
  ): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log('Attempting to sign out user');

      if (userId) {
        // Invalidate all user sessions
        await this.supabaseService.invalidateUserSessions(userId);
      }

      this.logger.log('Successfully signed out user');

      return {
        data: null,
        message: 'User signed out successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in signOut: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // USER MANAGEMENT METHODS
  // =====================================================

  async getCurrentUser(
    userId: string,
  ): Promise<StandardResponseDto<Omit<User, 'password_hash'>>> {
    try {
      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return user without password
      const { password_hash, ...userWithoutPassword } = user;

      return {
        data: userWithoutPassword,
        message: 'User retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getCurrentUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileRequest,
  ): Promise<StandardResponseDto<Omit<User, 'password_hash'>>> {
    try {
      this.logger.log(`Updating profile for user: ${userId}`);

      const user = await this.supabaseService.updateUser(
        userId,
        updateProfileDto,
      );
      if (!user) {
        throw new BadRequestException('User not found');
      }

      this.logger.log(`Successfully updated profile for user: ${userId}`);

      // Return user without password
      const { password_hash, ...userWithoutPassword } = user;

      return {
        data: userWithoutPassword,
        message: 'Profile updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateProfile: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordRequest,
  ): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log(`Changing password for user: ${userId}`);

      // Get user
      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.supabaseService.verifyPassword(
        changePasswordDto.current_password,
        user.password_hash,
      );
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await require('bcrypt').hash(
        changePasswordDto.new_password,
        saltRounds,
      );

      // Update password
      await this.supabaseService.updateUser(userId, {
        password_hash: newPasswordHash,
      });

      // Invalidate all sessions
      await this.supabaseService.invalidateUserSessions(userId);

      this.logger.log(`Successfully changed password for user: ${userId}`);

      return {
        data: null,
        message: 'Password changed successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in changePassword: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // TOKEN VALIDATION METHODS
  // =====================================================

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = this.supabaseService.verifyAccessToken(token);
      if (!decoded || !decoded.sub) {
        return null;
      }

      // Check if session exists and is active
      const tokenHash = this.supabaseService.generateTokenHash(token);
      const session =
        await this.supabaseService.getSessionByTokenHash(tokenHash);

      if (!session || !session.is_active) {
        return null;
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        // Session expired, invalidate it
        await this.supabaseService.invalidateSession(session.id);
        return null;
      }

      const user = await this.supabaseService.getUserById(decoded.sub);
      if (!user || !user.is_active) {
        return null;
      }

      return user;
    } catch (error: any) {
      this.logger.error(`Error in validateToken: ${error.message}`);
      return null;
    }
  }

  // =====================================================
  // CLEANUP METHODS
  // =====================================================

  async cleanExpiredSessions(): Promise<void> {
    try {
      await this.supabaseService.cleanExpiredSessions();
      this.logger.log('Cleaned expired sessions');
    } catch (error: any) {
      this.logger.error(`Error in cleanExpiredSessions: ${error.message}`);
    }
  }
}
