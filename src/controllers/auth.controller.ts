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
import {
  setCookie,
  clearCookie,
  getAuthCookieOptions,
  getSessionCookieOptions,
  createSafeCookieOptions,
} from '../utils/cookie.utils';
import { cookieConfig } from '../config/cookie.config';

@ApiTags('auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Set cookies with proper configuration for frontend accessibility
   */
  private setAuthCookies(
    res: Response,
    token: string,
    userData: UserProfileDto,
  ) {
    // Get cookie options optimized for authentication
    const cookieOptions = getAuthCookieOptions();

    // Add domain if in production
    if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    console.log('🍪 Setting cookies with options:', {
      ...cookieOptions,
      token: token ? `${token.substring(0, 10)}...` : 'undefined',
      userData: userData ? 'present' : 'undefined',
    });

    // Set authentication token cookie
    setCookie(res, 'auth-token', token, cookieOptions);

    // Set user data cookie (accessible to frontend)
    setCookie(res, 'user', JSON.stringify(userData), cookieOptions);

    console.log('✅ Cookies set successfully');
  }

  /**
   * Clear authentication cookies
   */
  private clearAuthCookies(res: Response) {
    // Get cookie options for clearing
    const clearOptions = getAuthCookieOptions();

    // Add domain if in production
    if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
      clearOptions.domain = process.env.COOKIE_DOMAIN;
    }

    // Clear cookies using utility function
    clearCookie(res, 'auth-token', clearOptions);
    clearCookie(res, 'user', clearOptions);
  }

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

    // Set cookies with token and user data (accessible to frontend)
    if (authResponse.data && authResponse.access_token) {
      this.setAuthCookies(res, authResponse.access_token, authResponse.data);
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

    // Set cookies with token and user data (accessible to frontend)
    if (authResponse.data && authResponse.access_token) {
      this.setAuthCookies(res, authResponse.access_token, authResponse.data);
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
    this.clearAuthCookies(res);

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

  @Get('test-cookies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test cookie functionality',
    description: 'Sets test cookies to verify cookie handling is working.',
  })
  @ApiOkResponse({
    description: 'Test cookies set successfully',
    examples: {
      success: {
        summary: 'Test cookies set',
        value: {
          message: 'Test cookies set successfully',
          status: 'success',
          cookies: ['test-cookie', 'debug-cookie'],
        },
      },
    },
  })
  testCookies(@Res({ passthrough: true }) res: Response) {
    // Set test cookies with different configurations
    const testCookieOptions = getAuthCookieOptions();
    testCookieOptions.maxAge = 60 * 60 * 1000; // 1 hour

    const debugCookieOptions = getAuthCookieOptions();
    debugCookieOptions.maxAge = 60 * 60 * 1000; // 1 hour
    debugCookieOptions.sameSite = 'lax';

    // Set test cookies using utility functions
    setCookie(res, 'test-cookie', 'test-value-123', testCookieOptions);
    setCookie(res, 'debug-cookie', 'debug-value-456', debugCookieOptions);

    console.log('🧪 Test cookies set with options:', {
      testCookie: testCookieOptions,
      debugCookie: debugCookieOptions,
    });

    return {
      message: 'Test cookies set successfully',
      status: 'success',
      cookies: ['test-cookie', 'debug-cookie'],
      options: {
        testCookie: testCookieOptions,
        debugCookie: debugCookieOptions,
      },
    };
  }

  @Get('test-cookies-comprehensive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Comprehensive cookie testing',
    description:
      'Tests all cookie configurations and provides detailed debugging information.',
  })
  @ApiOkResponse({
    description: 'Comprehensive cookie test completed',
  })
  testCookiesComprehensive(@Res({ passthrough: true }) res: Response) {
    // Test different cookie configurations
    const authConfig = getAuthCookieOptions();
    const sessionConfig = getSessionCookieOptions();

    // Test authentication cookies
    setCookie(res, 'test-auth-token', 'test-jwt-token-123', authConfig);
    setCookie(
      res,
      'test-user-data',
      JSON.stringify({ id: 'test-123', email: 'test@example.com' }),
      authConfig,
    );

    // Test session cookies
    setCookie(res, 'test-session', 'session-data-456', sessionConfig);

    // Test custom cookies
    const customConfig = createSafeCookieOptions({
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'lax',
    });
    setCookie(res, 'test-custom', 'custom-value-789', customConfig);

    // Test environment-specific cookies
    const envInfo = cookieConfig.getEnvironmentInfo();
    setCookie(res, 'test-environment', JSON.stringify(envInfo), {
      ...authConfig,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    console.log('🧪 Comprehensive cookie test completed:', {
      authConfig,
      sessionConfig,
      customConfig,
      environment: envInfo,
    });

    return {
      message: 'Comprehensive cookie test completed',
      status: 'success',
      cookies: [
        'test-auth-token',
        'test-user-data',
        'test-session',
        'test-custom',
        'test-environment',
      ],
      configurations: {
        auth: authConfig,
        session: sessionConfig,
        custom: customConfig,
        environment: envInfo,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('cookie-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get cookie information',
    description: 'Returns information about current cookies and configuration.',
  })
  @ApiOkResponse({
    description: 'Cookie information retrieved successfully',
  })
  getCookieInfo(@Req() req: Request) {
    const cookies = req.headers.cookie;
    const cookieList = cookies ? cookies.split(';').map((c) => c.trim()) : [];

    return {
      message: 'Cookie information retrieved',
      status: 'success',
      data: {
        totalCookies: cookieList.length,
        cookies: cookieList,
        hasAuthToken: cookieList.some((c) => c.startsWith('auth-token=')),
        hasUserData: cookieList.some((c) => c.startsWith('user=')),
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin,
        host: req.headers.host,
      },
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
