import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
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

export class LoginDto {
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

export class AuthResponseDto {
  @ApiProperty({
    description: 'User profile information',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      name: 'John Doe',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
    },
  })
  user: {
    id: string;
    email: string;
    name?: string;
    created_at: string;
    updated_at: string;
  };

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'User registered successfully',
  })
  message?: string;
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

export class VerifyAuthResponseDto {
  @ApiProperty({
    description: 'Whether the user is authenticated',
    example: true,
  })
  isAuthenticated: boolean;

  @ApiPropertyOptional({
    description: 'User profile if authenticated',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      name: 'John Doe',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
    },
  })
  user?: {
    id: string;
    email: string;
    name?: string;
    created_at: string;
    updated_at: string;
  };
}
