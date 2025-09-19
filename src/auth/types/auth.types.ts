export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  is_active: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  access_token: string;
  session: {
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface SignUpRequest {
  email: string;
  name: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignOutRequest {
  // No additional fields needed for session-based auth
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar_url?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}
