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
import { StandardResponseDto, SignUpResponseDto } from './dto/auth.dto';

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
  ): Promise<StandardResponseDto<SignUpResponseDto>> {
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
        data: {
          user: userWithoutPassword,
        },
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
        Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
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
            expiresAt: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
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

      // If email is being updated, check if it's already taken by another user
      if (updateProfileDto.email) {
        const existingUser = await this.supabaseService.getUserByEmail(
          updateProfileDto.email,
        );
        if (existingUser && existingUser.id !== userId) {
          throw new BadRequestException(
            'Email is already taken by another user',
          );
        }
      }

      // Only allow email, name, and bio fields to be updated
      const { email, name, bio } = updateProfileDto;
      const allowedUpdates = { email, name, bio };

      const user = await this.supabaseService.updateUser(
        userId,
        allowedUpdates,
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

      // Validate that new password and confirm password match
      if (
        changePasswordDto.new_password !== changePasswordDto.confirm_password
      ) {
        throw new BadRequestException(
          'New password and confirm password do not match',
        );
      }

      // Check if new password is different from current password
      const isSamePassword = await this.supabaseService.verifyPassword(
        changePasswordDto.new_password,
        user.password_hash,
      );
      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
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
        updated_at: new Date().toISOString(),
      });

      // Invalidate all sessions (this will sign out the user)
      await this.supabaseService.invalidateUserSessions(userId);

      this.logger.log(
        `Successfully changed password and signed out user: ${userId}`,
      );

      return {
        data: null,
        message:
          'Password changed successfully. You have been signed out for security reasons.',
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
  // USER MANAGEMENT METHODS (Admin Only)
  // =====================================================

  async getAllUsers(query: {
    role?: 'USER' | 'ADMIN';
    is_active?: boolean;
    email_verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?:
      | 'name'
      | 'email'
      | 'role'
      | 'is_active'
      | 'created_at'
      | 'last_login_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<
    StandardResponseDto<{
      users: Omit<User, 'password_hash'>[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    }>
  > {
    try {
      this.logger.log('Getting all users with filters');

      const {
        data: users,
        count,
        error,
      } = await this.supabaseService.getAllUsers(query);

      if (error) {
        throw new Error(`Failed to get users: ${error.message}`);
      }

      const page = query.page || 1;
      const limit = query.limit || 10;
      const totalPages = Math.ceil((count || 0) / limit);

      // Remove password_hash from all users
      const usersWithoutPassword = users.map(
        ({ password_hash, ...user }) => user,
      );

      return {
        data: {
          users: usersWithoutPassword,
          total: count || 0,
          page,
          limit,
          total_pages: totalPages,
        },
        message: 'Users retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getAllUsers: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getUserStats(): Promise<
    StandardResponseDto<{
      total: number;
      active: number;
      inactive: number;
      admins: number;
      users: number;
      verified: number;
      unverified: number;
      today: number;
      this_week: number;
      this_month: number;
    }>
  > {
    try {
      this.logger.log('Getting user statistics');

      const { data, error } = await this.supabaseService.getUserStats();

      if (error) {
        throw new Error(`Failed to get user stats: ${error.message}`);
      }

      return {
        data,
        message: 'User statistics retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getUserStats: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getUserById(
    userId: string,
  ): Promise<StandardResponseDto<Omit<User, 'password_hash'>>> {
    try {
      this.logger.log(`Getting user by ID: ${userId}`);

      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
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
      this.logger.error(`Error in getUserById: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getUserWithSessions(userId: string): Promise<
    StandardResponseDto<{
      user: Omit<User, 'password_hash'>;
      sessions: any[];
    }>
  > {
    try {
      this.logger.log(`Getting user with sessions: ${userId}`);

      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { data: sessions, error } =
        await this.supabaseService.getUserSessions(userId);
      if (error) {
        throw new Error(`Failed to get user sessions: ${error.message}`);
      }

      // Return user without password
      const { password_hash, ...userWithoutPassword } = user;

      return {
        data: {
          user: userWithoutPassword,
          sessions: sessions || [],
        },
        message: 'User with sessions retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getUserWithSessions: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateUserStatus(
    userId: string,
    isActive: boolean,
  ): Promise<StandardResponseDto<Omit<User, 'password_hash'>>> {
    try {
      this.logger.log(
        `Updating user status: ${userId} to ${isActive ? 'active' : 'inactive'}`,
      );

      const { data, error } = await this.supabaseService.updateUserStatus(
        userId,
        isActive,
      );
      if (error) {
        throw new Error(`Failed to update user status: ${error.message}`);
      }

      // Return user without password
      const { password_hash, ...userWithoutPassword } = data;

      return {
        data: userWithoutPassword,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateUserStatus: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateUserRole(
    userId: string,
    role: 'USER' | 'ADMIN',
  ): Promise<StandardResponseDto<Omit<User, 'password_hash'>>> {
    try {
      this.logger.log(`Updating user role: ${userId} to ${role}`);

      const { data, error } = await this.supabaseService.updateUserRole(
        userId,
        role,
      );
      if (error) {
        throw new Error(`Failed to update user role: ${error.message}`);
      }

      // Return user without password
      const { password_hash, ...userWithoutPassword } = data;

      return {
        data: userWithoutPassword,
        message: `User role updated to ${role} successfully`,
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateUserRole: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async forceLogoutUser(userId: string): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log(`Force logging out user: ${userId}`);

      const { error } = await this.supabaseService.forceLogoutUser(userId);
      if (error) {
        throw new Error(`Failed to force logout user: ${error.message}`);
      }

      return {
        data: null,
        message: 'User logged out successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in forceLogoutUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async deleteUser(userId: string): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log(`Deleting user: ${userId}`);

      // Check if user exists
      const user = await this.supabaseService.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Delete user
      const { error } = await this.supabaseService.deleteUser(userId);
      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      this.logger.log(`Successfully deleted user: ${userId}`);

      return {
        data: null,
        message: 'User deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in deleteUser: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
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
