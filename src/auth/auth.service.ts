import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from './email.service';
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
import { UserNotVerifiedException } from './exceptions/user-not-verified.exception';
import { AccountNotFoundException } from './exceptions/account-not-found.exception';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================

  async signUp(
    signUpDto: SignUpRequest,
  ): Promise<StandardResponseDto<{ message: string }>> {
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

      // Generate 5-digit OTP
      const otp = Math.floor(10000 + Math.random() * 90000).toString();

      // Store OTP in database
      await this.supabaseService.createOtpRecord(signUpDto.email, otp);

      // Send OTP email
      const emailSent = await this.emailService.sendOtpEmail(
        signUpDto.email,
        otp,
        signUpDto.name,
      );

      if (!emailSent) {
        this.logger.warn(`Failed to send OTP email to ${signUpDto.email}`);
      }

      this.logger.log(`OTP sent to ${signUpDto.email}`);

      return {
        data: {
          message: 'OTP sent to your email. Please verify your account.',
        },
        message: 'OTP sent successfully',
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
        throw new AccountNotFoundException();
      }

      // Check if user is active
      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Check if email is verified
      if (!user.email_verified) {
        throw new UserNotVerifiedException();
      }

      // Verify password
      const isPasswordValid = await this.supabaseService.verifyPassword(
        signInDto.password,
        user.password_hash,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate access and refresh tokens
      const accessToken = this.supabaseService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = this.supabaseService.generateRefreshToken({
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

      // Create refresh token record
      await this.supabaseService.createRefreshTokenRecord(
        user.id,
        refreshToken,
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
          refresh_token: refreshToken,
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
  // EMAIL VERIFICATION AND PASSWORD RESET METHODS
  // =====================================================

  async verifyAccount(verifyAccountDto: {
    email: string;
    otp: string;
  }): Promise<StandardResponseDto<{ user: Omit<User, 'password_hash'> }>> {
    try {
      this.logger.log(`Verifying account for email: ${verifyAccountDto.email}`);

      // Verify OTP
      const isOtpValid = await this.supabaseService.verifyOtp(
        verifyAccountDto.email,
        verifyAccountDto.otp,
      );

      if (!isOtpValid) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Get user data from signup (we need to store this temporarily or get it from request)
      // For now, we'll create the user with a default password that they'll need to change
      const tempPassword = Math.random().toString(36).slice(-8);
      const user = await this.supabaseService.createUser(
        verifyAccountDto.email,
        'User', // We'll need to get this from the signup data
        tempPassword,
      );

      // Mark email as verified
      await this.supabaseService.updateUser(user.id, {
        email_verified: true,
      });

      this.logger.log(`Account verified successfully for: ${user.id}`);

      // Return user without password
      const { password_hash, ...userWithoutPassword } = user;

      return {
        data: {
          user: userWithoutPassword,
        },
        message: 'Account verified successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in verifyAccount: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async sendOtp(sendOtpDto: {
    email: string;
  }): Promise<StandardResponseDto<{ message: string }>> {
    try {
      this.logger.log(`Sending OTP to email: ${sendOtpDto.email}`);

      // Check if user exists
      const user = await this.supabaseService.getUserByEmail(sendOtpDto.email);

      // Generate 5-digit OTP
      const otp = Math.floor(10000 + Math.random() * 90000).toString();

      // Store OTP in database
      await this.supabaseService.createOtpRecord(sendOtpDto.email, otp);

      // Send OTP email
      const emailSent = await this.emailService.sendOtpEmail(
        sendOtpDto.email,
        otp,
        user?.name || 'User', // Use user name if exists, otherwise default
      );

      if (!emailSent) {
        this.logger.warn(`Failed to send OTP email to ${sendOtpDto.email}`);
      }

      this.logger.log(`OTP sent to ${sendOtpDto.email}`);

      return {
        data: {
          message: 'OTP sent to your email',
        },
        message: 'OTP sent successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in sendOtp: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async forgotPassword(forgotPasswordDto: {
    email: string;
  }): Promise<StandardResponseDto<{ message: string }>> {
    try {
      this.logger.log(
        `Processing forgot password for email: ${forgotPasswordDto.email}`,
      );

      // Check if user exists
      const user = await this.supabaseService.getUserByEmail(
        forgotPasswordDto.email,
      );
      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          data: {
            message:
              'If an account with this email exists, a password reset link has been sent.',
          },
          message: 'Password reset email sent',
          status: 'success',
        };
      }

      // Generate reset token
      const resetToken = require('crypto').randomBytes(32).toString('hex');

      // Store reset token in database
      await this.supabaseService.createPasswordResetToken(
        forgotPasswordDto.email,
        resetToken,
      );

      // Send password reset email
      const emailSent = await this.emailService.sendPasswordResetEmail(
        forgotPasswordDto.email,
        resetToken,
        user.name,
      );

      if (!emailSent) {
        this.logger.warn(
          `Failed to send password reset email to ${forgotPasswordDto.email}`,
        );
      }

      this.logger.log(
        `Password reset email sent to ${forgotPasswordDto.email}`,
      );

      return {
        data: {
          message:
            'If an account with this email exists, a password reset link has been sent.',
        },
        message: 'Password reset email sent',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in forgotPassword: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async resetPasswordWithToken(resetPasswordDto: {
    token: string;
    new_password: string;
    confirm_password: string;
  }): Promise<StandardResponseDto<{ message: string }>> {
    try {
      this.logger.log('Processing password reset with token');

      // Validate passwords match
      if (resetPasswordDto.new_password !== resetPasswordDto.confirm_password) {
        throw new BadRequestException(
          'New password and confirm password do not match',
        );
      }

      // Verify reset token
      const email = await this.supabaseService.verifyPasswordResetToken(
        resetPasswordDto.token,
      );
      if (!email) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Get user
      const user = await this.supabaseService.getUserByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await require('bcrypt').hash(
        resetPasswordDto.new_password,
        saltRounds,
      );

      // Update password
      await this.supabaseService.updateUser(user.id, {
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      });

      // Delete the reset token
      await this.supabaseService.deletePasswordResetToken(
        resetPasswordDto.token,
      );

      // Invalidate all user sessions and refresh tokens
      await this.supabaseService.invalidateUserSessions(user.id);
      await this.supabaseService.invalidateUserRefreshTokens(user.id);

      this.logger.log(`Password reset successfully for user: ${user.id}`);

      return {
        data: {
          message:
            'Password reset successfully. Please sign in with your new password.',
        },
        message: 'Password reset successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in resetPasswordWithToken: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async refreshToken(refreshTokenDto: {
    refresh_token: string;
  }): Promise<
    StandardResponseDto<{ access_token: string; refresh_token: string }>
  > {
    try {
      this.logger.log('Processing refresh token request');

      // Verify refresh token
      const userId = await this.supabaseService.verifyRefreshToken(
        refreshTokenDto.refresh_token,
      );
      if (!userId) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Get user
      const user = await this.supabaseService.getUserById(userId);
      if (!user || !user.is_active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new access token
      const newAccessToken = this.supabaseService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Generate new refresh token
      const newRefreshToken = this.supabaseService.generateRefreshToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Invalidate old refresh token
      await this.supabaseService.invalidateRefreshToken(
        refreshTokenDto.refresh_token,
      );

      // Create new refresh token record
      await this.supabaseService.createRefreshTokenRecord(
        userId,
        newRefreshToken,
      );

      this.logger.log(`Tokens refreshed successfully for user: ${userId}`);

      return {
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
        message: 'Tokens refreshed successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in refreshToken: ${errorMessage}`);
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
