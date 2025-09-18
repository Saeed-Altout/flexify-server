import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  SignUpDto,
  SignInDto,
  AuthResponseDto,
  ErrorResponseDto,
  StandardResponseDto,
  UserProfileDto,
} from './dto/auth.dto';
import type { UserProfile } from './types/auth.types';

@ApiTags('auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sign up a new user',
    description:
      'Creates a new user account with email and name. Password is optional for Supabase magic links. Session token is automatically set as HTTP-only cookie with 7-day expiry. Returns only success message, no user data.',
  })
  @ApiBody({
    type: SignUpDto,
    description: 'User sign up data',
    examples: {
      withPassword: {
        summary: 'Sign up with password',
        value: {
          email: 'john.doe@example.com',
          name: 'John Doe',
          password: 'securePassword123',
        },
      },
      withoutPassword: {
        summary: 'Sign up without password (magic link)',
        value: {
          email: 'john.doe@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      'User successfully signed up. Session token is set as HTTP-only cookie.',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null', example: null },
        message: { type: 'string', example: 'User signed up successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or user already exists',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StandardResponseDto<null>> {
    const authResponse = await this.authService.signUp(signUpDto);

    // Set HTTP-only cookie with 7-day expiry
    if (authResponse.access_token) {
      res.cookie('session_token', authResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: '/',
      });
    }

    return {
      data: null,
      message: authResponse.message,
      status: authResponse.status,
    };
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User sign in',
    description:
      'Authenticates a user with email and password. Session token is automatically set as HTTP-only cookie with 7-day expiry. Returns only success message, no user data.',
  })
  @ApiBody({
    type: SignInDto,
    description: 'User sign in credentials',
    examples: {
      withPassword: {
        summary: 'Sign in with password',
        value: {
          email: 'john.doe@example.com',
          password: 'securePassword123',
        },
      },
      withoutPassword: {
        summary: 'Sign in without password (magic link)',
        value: {
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'User successfully signed in. Session token is set as HTTP-only cookie.',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'null', example: null },
        message: { type: 'string', example: 'User signed in successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ErrorResponseDto,
  })
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StandardResponseDto<null>> {
    const authResponse = await this.authService.signIn(signInDto);

    // Set HTTP-only cookie with 7-day expiry
    if (authResponse.access_token) {
      res.cookie('session_token', authResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: '/',
      });
    }

    return {
      data: null,
      message: authResponse.message,
      status: authResponse.status,
    };
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User sign out',
    description: 'Signs out the current user and clears the session cookie.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'User successfully signed out',
    examples: {
      success: {
        summary: 'Sign out successful',
        value: {
          data: null,
          message: 'User signed out successfully',
          status: 'success',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StandardResponseDto<null>> {
    const token = this.extractTokenFromRequest(req);

    if (token) {
      await this.authService.signOut(token);
    }

    // Clear the session cookie
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return {
      data: null,
      message: 'User signed out successfully',
      status: 'success',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Current user profile retrieved successfully',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'User profile retrieved',
        value: {
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            role: 'USER',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          message: 'Current user retrieved successfully',
          status: 'success',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  getCurrentUser(
    @CurrentUser() user: UserProfile,
  ): StandardResponseDto<UserProfileDto> {
    return {
      data: user,
      message: 'Current user retrieved successfully',
      status: 'success',
    };
  }

  private extractTokenFromRequest(req: Request): string | undefined {
    // First try to get from cookie (preferred for session-based auth)
    const cookieToken = req.cookies?.session_token;
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to Authorization header for backward compatibility
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
