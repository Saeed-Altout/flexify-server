import {
  Controller,
  Post,
  Get,
  Put,
  Body,
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
} from '@nestjs/swagger';
import type { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  SignUpDto,
  SignInDto,
  SignOutDto,
  ChangePasswordDto,
  UpdateProfileDto,
  AuthResponseDto,
  UserDto,
  StandardResponseDto,
  SignInResponseDto,
  SignUpResponseDto,
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
        data: { $ref: '#/components/schemas/SignUpResponseDto' },
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
  ): Promise<StandardResponseDto<SignUpResponseDto>> {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password. Access and refresh tokens are set as HTTP-only cookies.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/SignInResponseDto' },
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
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<StandardResponseDto<SignInResponseDto>> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const result = await this.authService.signIn(
      signInDto,
      ipAddress,
      userAgent,
    );

    // Set HTTP-only cookie for access token
    res.cookie('access_token', result.tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed to 'lax' for better cross-page compatibility
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Explicit domain for dev
    });

    // Return only the response data without tokens
    return {
      data: result.data,
      message: result.message,
      status: result.status,
    };
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
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<StandardResponseDto<null>> {
    const result = await this.authService.signOut(signOutDto, user.id);

    // Clear cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    });

    return result;
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
    description: 'Update user profile information (name, avatar)',
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
    description: 'Change user password (requires current password)',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null' },
        message: { type: 'string', example: 'Password changed successfully' },
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
    description: 'Invalid current password',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<null>> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }
}
