import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  SignUpDto,
  SignInDto,
  SignOutDto,
  ChangePasswordDto,
  UpdateProfileDto,
  AuthResponseDto,
  SignUpResponseDto,
  UserDto,
  StandardResponseDto,
  UserQueryDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  UserListResponseDto,
  UserStatsDto,
  UserWithSessionsDto,
  VerifyAccountDto,
  SendOtpDto,
  ForgotPasswordRequestDto,
  ResetPasswordWithTokenDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import type { User } from './types/auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User Registration',
    description: 'Register a new user account with email, name, and password',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string', example: 'User signed up successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists with this email',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<StandardResponseDto<{ message: string }>> {
    return this.authService.signUp(signUpDto);
  }

  @Post('verify-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Account with OTP',
    description: 'Verify user account using the 5-digit OTP sent to email',
  })
  @ApiBody({ type: VerifyAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string', example: 'Account verified successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  async verifyAccount(
    @Body() verifyAccountDto: VerifyAccountDto,
  ): Promise<StandardResponseDto<{ user: UserDto }>> {
    return this.authService.verifyAccount(verifyAccountDto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Send a new 5-digit OTP to user email for verification',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'object', properties: { message: { type: 'string' } } },
        message: { type: 'string', example: 'OTP sent successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  async sendOtp(
    @Body() sendOtpDto: SendOtpDto,
  ): Promise<StandardResponseDto<{ message: string }>> {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Send password reset email to user',
  })
  @ApiBody({ type: ForgotPasswordRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'object', properties: { message: { type: 'string' } } },
        message: { type: 'string', example: 'Password reset email sent' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordRequestDto,
  ): Promise<StandardResponseDto<{ message: string }>> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset Password with Token',
    description: 'Reset user password using the token from email',
  })
  @ApiBody({ type: ResetPasswordWithTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'object', properties: { message: { type: 'string' } } },
        message: { type: 'string', example: 'Password reset successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or password validation failed',
  })
  async resetPasswordWithToken(
    @Body() resetPasswordDto: ResetPasswordWithTokenDto,
  ): Promise<StandardResponseDto<{ message: string }>> {
    return this.authService.resetPasswordWithToken(resetPasswordDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Access Token',
    description: 'Get new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
          },
        },
        message: { type: 'string', example: 'Tokens refreshed successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<
    StandardResponseDto<{ access_token: string; refresh_token: string }>
  > {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password. Returns user data, access token, and session information.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/AuthResponseDto' },
        message: { type: 'string', example: 'User signed in successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async signIn(
    @Body() signInDto: SignInDto,
    @Request() req: any,
  ): Promise<StandardResponseDto<AuthResponseDto>> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.authService.signIn(signInDto, ipAddress, userAgent);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User Logout',
    description: 'Sign out user and invalidate their sessions',
  })
  @ApiBody({ type: SignOutDto })
  @ApiResponse({
    status: 200,
    description: 'User signed out successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: { type: 'string', example: 'User signed out successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async signOut(
    @Body() signOutDto: SignOutDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<null>> {
    return this.authService.signOut(signOutDto, user.id);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Current User',
    description: 'Get the current authenticated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string', example: 'User retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser(
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<UserDto>> {
    return this.authService.getCurrentUser(user.id);
  }

  @Get('debug-cookies')
  @ApiOperation({
    summary: 'Debug Cookies',
    description:
      'Debug endpoint to check cookie information (development only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cookie debug information',
  })
  async debugCookies(@Request() req: any): Promise<any> {
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Debug endpoint not available in production' };
    }

    return {
      cookies: req.cookies,
      nextCwsCookies: {
        token: req.cookies?.NEXT_CWS_TOKEN ? 'Present' : 'Missing',
        user: req.cookies?.NEXT_CWS_USER
          ? JSON.parse(req.cookies.NEXT_CWS_USER)
          : 'Missing',
        session: req.cookies?.NEXT_CWS_SESSION
          ? JSON.parse(req.cookies.NEXT_CWS_SESSION)
          : 'Missing',
      },
      headers: {
        cookie: req.headers.cookie,
        origin: req.headers.origin,
        referer: req.headers.referer,
        userAgent: req.headers['user-agent'],
        host: req.headers.host,
      },
      secure: req.secure,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update User Profile',
    description:
      'Update user profile information (name, email, bio). Note: Avatar and CV files should be updated via file upload endpoints.',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string', example: 'Profile updated successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<UserDto>> {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change Password',
    description:
      'Change user password (requires current password and confirm password). User will be signed out after successful password change.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully and user signed out',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: {
          type: 'string',
          example:
            'Password changed successfully. You have been signed out for security reasons.',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or password validation failed',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: {
          type: 'string',
          examples: [
            'Current password is incorrect',
            'New password and confirm password do not match',
            'New password must be different from current password',
            'Validation failed',
          ],
        },
        status: { type: 'string', example: 'error' },
      },
    },
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<null>> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  // =====================================================
  // USER MANAGEMENT ENDPOINTS (Admin Only)
  // =====================================================

  @Get('users')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Users',
    description:
      'Get a paginated list of all users with optional filtering (Admin only)',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role',
    enum: ['USER', 'ADMIN'],
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'email_verified',
    required: false,
    description: 'Filter by email verification status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for name or email',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Sort by field',
    enum: ['name', 'email', 'role', 'is_active', 'created_at', 'last_login_at'],
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserListResponseDto' },
        message: { type: 'string', example: 'Users retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers(
    @Query() query: UserQueryDto,
  ): Promise<StandardResponseDto<UserListResponseDto>> {
    return this.authService.getAllUsers(query);
  }

  @Get('users/stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get User Statistics',
    description: 'Get user statistics and analytics (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserStatsDto' },
        message: {
          type: 'string',
          example: 'User statistics retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserStats(): Promise<StandardResponseDto<UserStatsDto>> {
    return this.authService.getUserStats();
  }

  @Get('users/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get User by ID',
    description: 'Get a specific user by their ID (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string', example: 'User retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<UserDto>> {
    return this.authService.getUserById(id);
  }

  @Get('users/:id/sessions')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get User Sessions',
    description: 'Get all active sessions for a specific user (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User sessions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserDto' },
            sessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  user_id: { type: 'string' },
                  expires_at: { type: 'string' },
                  is_active: { type: 'boolean' },
                  ip_address: { type: 'string' },
                  user_agent: { type: 'string' },
                  created_at: { type: 'string' },
                  updated_at: { type: 'string' },
                },
              },
            },
          },
        },
        message: {
          type: 'string',
          example: 'User sessions retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserWithSessions(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<{ user: UserDto; sessions: any[] }>> {
    return this.authService.getUserWithSessions(id);
  }

  @Put('users/:id/status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update User Status',
    description: 'Activate or deactivate a user account (Admin only)',
  })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserDto' },
        message: { type: 'string', example: 'User activated successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<StandardResponseDto<UserDto>> {
    return this.authService.updateUserStatus(id, updateUserStatusDto.is_active);
  }

  @Put('users/:id/role')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update User Role',
    description: 'Change user role between USER and ADMIN (Admin only)',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/UserDto' },
        message: {
          type: 'string',
          example: 'User role updated to ADMIN successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<StandardResponseDto<UserDto>> {
    return this.authService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Post('users/:id/logout')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Force Logout User',
    description:
      'Force logout a user by invalidating all their sessions (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: { type: 'string', example: 'User logged out successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async forceLogoutUser(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<null>> {
    return this.authService.forceLogoutUser(id);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete User',
    description: 'Permanently delete a user account (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: { type: 'string', example: 'User deleted successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<null>> {
    return this.authService.deleteUser(id);
  }
}
