import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    type: String,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    description: 'User password (optional for Supabase magic links)',
    example: 'securePassword123',
    minLength: 6,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class SignInDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'User password (optional for Supabase magic links)',
    example: 'securePassword123',
    type: String,
  })
  @IsOptional()
  @IsString()
  password?: string;
}

export class StandardResponseDto<T = any> {
  @ApiProperty({
    description: 'Response data',
    example: {},
  })
  data: T;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response status',
    example: 'success',
  })
  status: string;
}

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  name?: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: ['ADMIN', 'USER'],
  })
  role: 'ADMIN' | 'USER';

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updated_at: string;
}

export class AuthResponseDto extends StandardResponseDto<UserProfileDto> {
  // Inherits data, message, and status from StandardResponseDto
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}
