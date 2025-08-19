import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfile } from '../auth/types/auth.types';
import {
  SignUpDto,
  SignInDto,
  StandardResponseDto,
  UserProfileDto,
} from '../auth/dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{
    data: UserProfileDto;
    message: string;
    status: string;
    access_token?: string;
  }> {
    try {
      this.logger.log(
        `Attempting to sign up user with email: ${signUpDto.email}`,
      );

      // Check if user already exists
      const existingUser = await this.supabaseService.getUserByEmail(
        signUpDto.email,
      );
      if (existingUser) {
        throw new BadRequestException('User already exists with this email');
      }

      // Create user in Supabase
      const user = await this.supabaseService.createUser(
        signUpDto.email,
        signUpDto.name,
        signUpDto.password,
      );

      this.logger.log(`Successfully signed up user: ${user.id}`);

      // For sign up, we need to sign in the user to get a token
      let access_token: string | undefined;
      try {
        const signInResponse = await this.supabaseService.signInUser(
          signUpDto.email,
          signUpDto.password,
        );
        access_token = signInResponse.access_token;
      } catch {
        this.logger.warn('Could not automatically sign in user after sign up');
      }

      return {
        data: user,
        message: 'User signed up successfully',
        status: 'success',
        access_token,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Sign up failed: ${errorMessage}`);

      // If it's already an HTTP exception, re-throw it
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      // For any other error, throw a generic bad request
      throw new BadRequestException('Failed to create user account');
    }
  }

  async signIn(signInDto: SignInDto): Promise<{
    data: UserProfileDto;
    message: string;
    status: string;
    access_token?: string;
  }> {
    try {
      this.logger.log(
        `Attempting to sign in user with email: ${signInDto.email}`,
      );

      const authResponse = await this.supabaseService.signInUser(
        signInDto.email,
        signInDto.password,
      );

      this.logger.log(`Successfully signed in user: ${authResponse.user.id}`);

      return {
        data: authResponse.user,
        message: 'User signed in successfully',
        status: 'success',
        access_token: authResponse.access_token,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Sign in failed: ${errorMessage}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async signOut(token: string): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log('Attempting to sign out user');

      await this.supabaseService.signOutUser(token);

      this.logger.log('Successfully signed out user');

      return {
        data: null,
        message: 'User signed out successfully',
        status: 'success',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Sign out failed: ${errorMessage}`);

      // If it's already an HTTP exception, re-throw it
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      // For any other error, throw an unauthorized exception
      throw new UnauthorizedException('Failed to sign out user');
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Get current user failed: ${errorMessage}`);

      // If it's already an HTTP exception, re-throw it
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      // For any other error, throw an unauthorized exception
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async validateToken(token: string): Promise<UserProfile | null> {
    try {
      return await this.supabaseService.verifySession(token);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Token validation failed: ${errorMessage}`);
      return null;
    }
  }
}
