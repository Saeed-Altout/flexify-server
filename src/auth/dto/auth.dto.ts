import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsNumber,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { UserRole } from '../types/auth.types';

@ValidatorConstraint({ name: 'MatchPassword', async: false })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return confirmPassword === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Confirm password must match new password';
  }
}

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
  // No additional fields needed for session-based auth
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

  @ApiProperty({
    example: 'newPassword123',
    description: 'Confirm new password (must match new_password)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Validate(MatchPasswordConstraint, ['new_password'])
  confirm_password: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Smith', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example:
      'Passionate developer with 5+ years of experience in full-stack development. Love creating innovative solutions and learning new technologies.',
    description: 'User biography/description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
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

export class VerifyAccountDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345',
    description: '5-digit OTP code',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(5)
  otp: string;
}

export class SendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordWithTokenDto {
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

  @ApiProperty({
    example: 'newPassword123',
    description: 'Confirm new password (must match new_password)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Validate(MatchPasswordConstraint, ['new_password'])
  confirm_password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh_token_here',
    description: 'Refresh token',
  })
  @IsString()
  refresh_token: string;
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
    example:
      'Passionate developer with 5+ years of experience in full-stack development. Love creating innovative solutions and learning new technologies.',
    description: 'User biography/description',
  })
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  avatar_url?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cv.pdf',
    description: 'CV file URL',
  })
  cv_file_url?: string;

  @ApiPropertyOptional({
    example: 'resume.pdf',
    description: 'CV file name',
  })
  cv_file_name?: string;

  @ApiPropertyOptional({
    example: 1024000,
    description: 'CV file size in bytes',
  })
  cv_file_size?: number;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00Z',
    description: 'CV upload timestamp',
  })
  cv_uploaded_at?: string;

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

export class SessionDto {
  @ApiProperty({ example: true, description: 'Is session active' })
  isActive: boolean;

  @ApiProperty({
    example: '2023-01-01T00:15:00Z',
    description: 'Session expiration time',
  })
  expiresAt: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Session creation time',
  })
  createdAt: string;

  @ApiPropertyOptional({ example: '192.168.1.1', description: 'IP address' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...', description: 'User agent' })
  userAgent?: string;
}

export class SignUpResponseDto {
  @ApiProperty({ type: UserDto, description: 'User information' })
  user: UserDto;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserDto, description: 'User information' })
  user: UserDto;

  @ApiProperty({ example: 'jwt_token_here', description: 'Access token' })
  access_token: string;

  @ApiProperty({ example: 'refresh_token_here', description: 'Refresh token' })
  refresh_token: string;

  @ApiProperty({ type: SessionDto, description: 'Session information' })
  session: SessionDto;
}

// =====================================================
// USER MANAGEMENT DTOs (Admin Only)
// =====================================================

export class UserQueryDto {
  @ApiPropertyOptional({
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'Filter by user role',
  })
  @IsOptional()
  @IsString()
  role?: 'USER' | 'ADMIN';

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by email verification status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  email_verified?: boolean;

  @ApiPropertyOptional({
    example: 'john',
    description: 'Search term for name or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'created_at',
    enum: ['name', 'email', 'role', 'is_active', 'created_at', 'last_login_at'],
    description: 'Sort by field',
  })
  @IsOptional()
  @IsString()
  sort_by?:
    | 'name'
    | 'email'
    | 'role'
    | 'is_active'
    | 'created_at'
    | 'last_login_at';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}

export class UpdateUserStatusDto {
  @ApiProperty({
    example: true,
    description: 'User active status',
  })
  @IsBoolean()
  is_active: boolean;
}

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'ADMIN',
    enum: ['USER', 'ADMIN'],
    description: 'User role',
  })
  @IsString()
  role: 'USER' | 'ADMIN';
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserDto], description: 'List of users' })
  users: UserDto[];

  @ApiProperty({ example: 50, description: 'Total number of users' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  total_pages: number;
}

export class UserStatsDto {
  @ApiProperty({ example: 100, description: 'Total users' })
  total: number;

  @ApiProperty({ example: 80, description: 'Active users' })
  active: number;

  @ApiProperty({ example: 20, description: 'Inactive users' })
  inactive: number;

  @ApiProperty({ example: 5, description: 'Admin users' })
  admins: number;

  @ApiProperty({ example: 95, description: 'Regular users' })
  users: number;

  @ApiProperty({ example: 90, description: 'Verified users' })
  verified: number;

  @ApiProperty({ example: 10, description: 'Unverified users' })
  unverified: number;

  @ApiProperty({ example: 5, description: 'New users today' })
  today: number;

  @ApiProperty({ example: 20, description: 'New users this week' })
  this_week: number;

  @ApiProperty({ example: 80, description: 'New users this month' })
  this_month: number;
}

export class UserSessionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Session ID',
  })
  id: string;

  @ApiProperty({
    example: 'user-id-here',
    description: 'User ID',
  })
  user_id: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Session expiration time',
  })
  expires_at: string;

  @ApiProperty({ example: true, description: 'Is session active' })
  is_active: boolean;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'IP address',
  })
  ip_address?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0...',
    description: 'User agent',
  })
  user_agent?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Session creation time',
  })
  created_at: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update time',
  })
  updated_at: string;
}

export class UserWithSessionsDto extends UserDto {
  @ApiProperty({
    type: [UserSessionDto],
    description: 'User active sessions',
  })
  sessions: UserSessionDto[];
}

export class StandardResponseDto<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: 'Success message', description: 'Response message' })
  message: string;

  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;
}
