export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  password_hash: string;
  avatar_url?: string;
  cv_file_url?: string;
  cv_file_name?: string;
  cv_file_size?: number;
  cv_uploaded_at?: string;
  theme?: string;
  timezone?: string;
  time_format?: string;
  language?: string;
  date_format?: string;
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
  confirm_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  bio?: string;
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

// =====================================================
// USER MANAGEMENT TYPES (Admin Only)
// =====================================================

export interface UserQuery {
  role?: UserRole;
  is_active?: boolean;
  email_verified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?:
    | 'name'
    | 'email'
    | 'role'
    | 'is_active'
    | 'created_at'
    | 'last_login_at';
  sort_order?: 'asc' | 'desc';
}

export interface UpdateUserStatusRequest {
  is_active: boolean;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UserListResponse {
  users: Omit<User, 'password_hash'>[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  users: number;
  verified: number;
  unverified: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface UserSession {
  id: string;
  user_id: string;
  expires_at: string;
  is_active: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithSessions extends Omit<User, 'password_hash'> {
  sessions: UserSession[];
}
