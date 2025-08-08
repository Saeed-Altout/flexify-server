/**
 * Frontend-focused cookie utilities for better cookie persistence
 * These functions are designed to work with the backend cookie configuration
 */

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Enhanced cookie getter with better parsing
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

/**
 * Enhanced cookie setter with better options handling
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof document === 'undefined') return;

  const {
    maxAge = 30 * 24 * 60 * 60 * 1000, // 30 days default
    path = '/',
    domain,
    secure = window.location.protocol === 'https:',
    sameSite = 'lax',
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (maxAge) cookieString += `; max-age=${maxAge}`;
  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;

  console.log(`🍪 Frontend cookie set: ${name}`, {
    value: value.length > 20 ? `${value.substring(0, 20)}...` : value,
    options: { maxAge, path, domain, secure, sameSite },
  });
}

/**
 * Enhanced cookie deleter with matching options
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {},
): void {
  if (typeof document === 'undefined') return;

  const { path = '/', domain } = options;

  // Set cookie with past expiration date
  const pastDate = new Date(0).toUTCString();
  let cookieString = `${name}=; expires=${pastDate}`;

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;

  document.cookie = cookieString;

  console.log(`🗑️ Frontend cookie deleted: ${name}`);
}

/**
 * Get user profile from cookie with error handling
 */
export function getUserFromCookie(): Record<string, unknown> | null {
  try {
    const userData = getCookie('user');
    if (!userData) return null;

    const user = JSON.parse(userData);
    console.log('👤 User data retrieved from cookie:', {
      id: user?.id,
      email: user?.email,
      name: user?.name,
    });

    return user;
  } catch (error) {
    console.error('❌ Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Get authentication token from cookie
 */
export function getAuthTokenFromCookie(): string | null {
  const token = getCookie('auth-token');
  if (token) {
    console.log('🔑 Auth token retrieved from cookie:', {
      length: token.length,
      preview: `${token.substring(0, 10)}...`,
    });
  }
  return token;
}

/**
 * Check if user is authenticated with detailed logging
 */
export function isAuthenticated(): boolean {
  const user = getUserFromCookie();
  const token = getAuthTokenFromCookie();

  const authenticated = !!(user && token);

  console.log('🔍 Authentication check:', {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated: authenticated,
  });

  return authenticated;
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  console.log('🧹 Clearing all auth cookies...');
  deleteCookie('auth-token');
  deleteCookie('user');
  console.log('✅ All auth cookies cleared');
}

/**
 * Get comprehensive authentication state
 */
export function getAuthState() {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      cookieCount: 0,
    };
  }

  const user = getUserFromCookie();
  const token = getAuthTokenFromCookie();
  const cookieCount = document.cookie.split(';').length;

  const state = {
    user,
    token,
    isAuthenticated: !!(user && token),
    cookieCount,
  };

  console.log('📊 Auth state:', state);
  return state;
}

/**
 * Refresh cookie expiration (useful for keeping users logged in)
 */
export function refreshCookieExpiration(): void {
  const user = getUserFromCookie();
  const token = getAuthTokenFromCookie();

  if (user && token) {
    console.log('🔄 Refreshing cookie expiration...');

    // Re-set cookies with fresh expiration
    setCookie('user', JSON.stringify(user), {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
      sameSite: 'lax',
    });

    setCookie('auth-token', token, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
      sameSite: 'lax',
    });

    console.log('✅ Cookie expiration refreshed');
  } else {
    console.log('⚠️ No user data or token found for refresh');
  }
}

/**
 * Monitor cookie changes (useful for debugging)
 */
export function monitorCookieChanges(): () => void {
  if (typeof window === 'undefined') return () => {};

  let lastCookieCount = document.cookie.split(';').length;

  const interval = setInterval(() => {
    const currentCookieCount = document.cookie.split(';').length;

    if (currentCookieCount !== lastCookieCount) {
      console.log('🍪 Cookie count changed:', {
        from: lastCookieCount,
        to: currentCookieCount,
        cookies: document.cookie.split(';').map((c) => c.trim().split('=')[0]),
      });
      lastCookieCount = currentCookieCount;
    }
  }, 1000);

  return () => clearInterval(interval);
}
