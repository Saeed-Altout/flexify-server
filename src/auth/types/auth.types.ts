export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: UserProfile;
  session?: any;
  access_token?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest {
  user: UserProfile;
}
