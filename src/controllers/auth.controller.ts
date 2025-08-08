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
  SignUpDto,
  SignInDto,
  AuthResponseDto,
  ErrorResponseDto,
  StandardResponseDto,
  UserProfileDto,
} from '../dto/auth.dto';
import type { UserProfile } from '../types/auth.types';

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
      'Creates a new user account with email and name. Password is optional for Supabase magic links.',
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
    description: 'User successfully signed up',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'Sign up successful',
        value: {
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          message: 'User signed up successfully',
          status: 'success',
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
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StandardResponseDto<UserProfileDto>> {
    const authResponse = await this.authService.signUp(signUpDto);

    // Set HTTP-only cookies with token and user data
    if (authResponse.data) {
      // Set token cookie if available
      if (authResponse.access_token) {
        res.cookie('auth-token', authResponse.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      // Set user cookie
      res.cookie('user', JSON.stringify(authResponse.data), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      data: authResponse.data,
      message: authResponse.message,
      status: authResponse.status,
    };
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User sign in',
    description:
      'Authenticates a user with email and password. Returns user profile and sets authentication cookies.',
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
    description: 'User successfully signed in',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'Sign in successful',
        value: {
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          message: 'User signed in successfully',
          status: 'success',
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
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StandardResponseDto<UserProfileDto>> {
    const authResponse = await this.authService.signIn(signInDto);

    // Set HTTP-only cookies with token and user data
    if (authResponse.data) {
      // Set token cookie if available
      if (authResponse.access_token) {
        res.cookie('auth-token', authResponse.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      // Set user cookie
      res.cookie('user', JSON.stringify(authResponse.data), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      data: authResponse.data,
      message: authResponse.message,
      status: authResponse.status,
    };
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User sign out',
    description:
      'Signs out the current user and clears the authentication cookies.',
  })
  @ApiCookieAuth('auth-token')
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

    // Clear the auth cookies
    res.clearCookie('auth-token');
    res.clearCookie('user');

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
  @ApiCookieAuth('auth-token')
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
