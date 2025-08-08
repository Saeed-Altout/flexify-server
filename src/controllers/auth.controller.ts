import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCookieAuth,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  ErrorResponseDto,
  VerifyAuthResponseDto,
} from '../dto/auth.dto';
import type { UserProfile } from '../types/auth.types';

@ApiTags('auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email and name. Password is optional for Supabase magic links.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
    examples: {
      withPassword: {
        summary: 'Register with password',
        value: {
          email: 'john.doe@example.com',
          name: 'John Doe',
          password: 'securePassword123',
        },
      },
      withoutPassword: {
        summary: 'Register without password (magic link)',
        value: {
          email: 'john.doe@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'Registration successful',
        value: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          message: 'User registered successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.register(registerDto);

    // Set HTTP-only cookie with the access token
    if (authResponse.access_token) {
      res.cookie('auth-token', authResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      user: authResponse.user,
      message: authResponse.message || 'User registered successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user with email and password. Returns user profile and sets authentication cookie.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      withPassword: {
        summary: 'Login with password',
        value: {
          email: 'john.doe@example.com',
          password: 'securePassword123',
        },
      },
      withoutPassword: {
        summary: 'Login without password (magic link)',
        value: {
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'Login successful',
        value: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          message: 'Login successful',
        },
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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.login(loginDto);

    // Set HTTP-only cookie with the access token
    if (authResponse.access_token) {
      res.cookie('auth-token', authResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      user: authResponse.user,
      message: 'Login successful',
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logs out the current user and clears the authentication cookie.',
  })
  @ApiCookieAuth('auth-token')
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'User successfully logged out',
    examples: {
      success: {
        summary: 'Logout successful',
        value: {
          message: 'Logged out successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const token = this.extractTokenFromRequest(req);

    if (token) {
      await this.authService.logout(token);
    }

    // Clear the auth cookie
    res.clearCookie('auth-token');

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user.',
  })
  @ApiCookieAuth('auth-token')
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Current user profile retrieved successfully',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'User profile retrieved',
        value: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          message: 'Current user retrieved successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  getCurrentUser(@CurrentUser() user: UserProfile): AuthResponseDto {
    return {
      user,
      message: 'Current user retrieved successfully',
    };
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify authentication status',
    description:
      'Checks if the current request is authenticated and returns user information if valid.',
  })
  @ApiCookieAuth('auth-token')
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Authentication status verified',
    type: VerifyAuthResponseDto,
    examples: {
      authenticated: {
        summary: 'User is authenticated',
        value: {
          isAuthenticated: true,
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      notAuthenticated: {
        summary: 'User is not authenticated',
        value: {
          isAuthenticated: false,
        },
      },
    },
  })
  async verifyAuth(
    @Req() req: Request,
  ): Promise<{ isAuthenticated: boolean; user?: UserProfile }> {
    const token = this.extractTokenFromRequest(req);

    if (!token) {
      return { isAuthenticated: false };
    }

    const user = await this.authService.validateToken(token);
    return {
      isAuthenticated: !!user,
      user: user || undefined,
    };
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh authentication token',
    description:
      'Refreshes the current authentication token and returns a new one.',
  })
  @ApiCookieAuth('auth-token')
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'Token refreshed',
        value: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          message: 'Token refreshed successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const token = this.extractTokenFromRequest(req);
    const authResponse = await this.authService.refreshToken(token!);

    // Set new HTTP-only cookie with the refreshed token
    if (authResponse.access_token) {
      res.cookie('auth-token', authResponse.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      user: authResponse.user,
      message: authResponse.message || 'Token refreshed successfully',
    };
  }

  private extractTokenFromRequest(req: Request): string | undefined {
    // First try to get from cookies
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookie = cookies
        .split(';')
        .find((cookie) => cookie.trim().startsWith('auth-token='));
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
    }

    // Fallback to Authorization header
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
