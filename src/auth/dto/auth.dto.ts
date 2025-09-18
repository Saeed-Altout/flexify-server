import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import type { UserRole } from '../types/auth.types';

export class SignUpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'securePassword123', description: 'User password' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

export class SignInDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'User password' })
  @IsString()
  password: string;
}

export class SignOutDto {
  @ApiPropertyOptional({
    example: 'refresh_token_here',
    description: 'Refresh token',
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_here', description: 'Refresh token' })
  @IsString()
  refresh_token: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Current password',
  })
  @IsString()
  current_password: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  new_password: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Smith', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset_token_here',
    description: 'Password reset token',
  })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  new_password: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: 'verification_token_here',
    description: 'Email verification token',
  })
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}

export class UserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  avatar_url?: string;

  @ApiProperty({
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({ example: true, description: 'Is user active' })
  is_active: boolean;

  @ApiProperty({ example: true, description: 'Is email verified' })
  email_verified: boolean;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00Z',
    description: 'Last login timestamp',
  })
  last_login_at?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  created_at: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update timestamp',
  })
  updated_at: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserDto, description: 'User information' })
  user: UserDto;

  @ApiProperty({ example: 'jwt_token_here', description: 'Access token' })
  access_token: string;

  @ApiPropertyOptional({
    example: 'refresh_token_here',
    description: 'Refresh token',
  })
  refresh_token?: string;
}

export class StandardResponseDto<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: 'Success message', description: 'Response message' })
  message: string;

  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;
}
