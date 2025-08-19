import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class StandardResponseDto<T = any> {
  data: T;

  message: string;

  status: string;
}

export class UserProfileDto {
  id: string;

  email: string;

  name?: string;

  role: 'ADMIN' | 'USER';

  created_at: string;

  updated_at: string;
}

export class AuthResponseDto extends StandardResponseDto<UserProfileDto> {}

export class ErrorResponseDto {
  statusCode: number;

  message: string;

  error: string;
}
