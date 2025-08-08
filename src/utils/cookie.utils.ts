/**
 * Cookie utility functions for frontend integration
 * These functions help manage authentication cookies set by the backend
 */

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // SSR support

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Set a cookie with proper configuration
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {},
): void {
  if (typeof document === 'undefined') return; // SSR support

  const {
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days default
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
  } = options;

  let cookieString = `${name}=${value}`;

  if (maxAge) cookieString += `; max-age=${maxAge}`;
  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Delete a cookie
 * @param name - Cookie name
 * @param options - Cookie options (must match original cookie)
 */
export function deleteCookie(
  name: string,
  options: { path?: string; domain?: string } = {},
): void {
  if (typeof document === 'undefined') return; // SSR support

  const { path = '/', domain } = options;

  let cookieString = `${name}=; max-age=0`;
  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;

  document.cookie = cookieString;
}

/**
 * Get user profile from cookie
 * @returns User profile or null if not found
 */
export function getUserFromCookie(): UserProfile | null {
  const userData = getCookie('user');
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Get authentication token from cookie
 * @returns Auth token or null if not found
 */
export function getAuthTokenFromCookie(): string | null {
  return getCookie('auth-token');
}

/**
 * Check if user is authenticated
 * @returns True if user is authenticated
 */
export function isAuthenticated(): boolean {
  const user = getUserFromCookie();
  const token = getAuthTokenFromCookie();
  return !!(user && token);
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  deleteCookie('auth-token');
  deleteCookie('user');
}

/**
 * Utility function to handle authentication state
 * @returns Object with user, token, and authentication status
 */
export function getAuthState() {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  const user = getUserFromCookie();
  const token = getAuthTokenFromCookie();

  return {
    user,
    token,
    isAuthenticated: !!(user && token),
  };
}
