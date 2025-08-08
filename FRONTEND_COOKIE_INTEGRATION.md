# Frontend Cookie Integration Guide

## 🍪 Overview

This guide explains how to properly integrate your frontend with the NestJS backend to ensure cookies persist after page refresh and provide seamless authentication.

## 🚀 Quick Start

### 1. Install the Cookie Utilities

Copy the `src/utils/frontend-cookie.utils.ts` file to your frontend project and import the functions:

```typescript
import {
  getAuthState,
  isAuthenticated,
  getUserFromCookie,
  getAuthTokenFromCookie,
  clearAuthCookies,
  refreshCookieExpiration,
  monitorCookieChanges,
} from './utils/frontend-cookie.utils';
```

### 2. Basic Authentication Check

```typescript
// Check if user is authenticated
if (isAuthenticated()) {
  const user = getUserFromCookie();
  console.log('User is logged in:', user.name);
} else {
  console.log('User is not authenticated');
}
```

### 3. Get Authentication State

```typescript
const authState = getAuthState();
console.log('Auth state:', authState);
// Returns: { user, token, isAuthenticated, cookieCount }
```

## 🔧 Advanced Usage

### Cookie Monitoring (Debug Mode)

```typescript
// Monitor cookie changes in development
if (process.env.NODE_ENV === 'development') {
  const stopMonitoring = monitorCookieChanges();

  // Stop monitoring when component unmounts
  return () => stopMonitoring();
}
```

### Cookie Refresh Strategy

```typescript
// Refresh cookies before they expire (recommended)
useEffect(() => {
  const refreshInterval = setInterval(
    () => {
      refreshCookieExpiration();
    },
    24 * 60 * 60 * 1000,
  ); // Every 24 hours

  return () => clearInterval(refreshInterval);
}, []);
```

## 🎯 React Hook Example

```typescript
import { useState, useEffect } from 'react';
import {
  getAuthState,
  refreshCookieExpiration,
} from './utils/frontend-cookie.utils';

export function useAuth() {
  const [authState, setAuthState] = useState(getAuthState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial auth check
    setAuthState(getAuthState());
    setLoading(false);

    // Refresh cookies periodically
    const refreshInterval = setInterval(
      () => {
        refreshCookieExpiration();
        setAuthState(getAuthState());
      },
      60 * 60 * 1000,
    ); // Every hour

    return () => clearInterval(refreshInterval);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/v1/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: Include cookies
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        // Cookies are automatically set by the backend
        setAuthState(getAuthState());
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear frontend state
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        cookieCount: 0,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    ...authState,
    loading,
    login,
    logout,
  };
}
```

## 🔒 Security Best Practices

### 1. Always Use `credentials: 'include'`

```typescript
// ✅ Correct
fetch('/api/v1/auth/me', {
  credentials: 'include', // Include cookies
});

// ❌ Wrong
fetch('/api/v1/auth/me'); // Cookies won't be sent
```

### 2. Handle Token Refresh

```typescript
// Check token validity before making requests
const makeAuthenticatedRequest = async (url: string) => {
  const token = getAuthTokenFromCookie();

  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    clearAuthCookies();
    window.location.href = '/login';
    return;
  }

  return response;
};
```

### 3. Automatic Logout on Token Expiry

```typescript
// Set up automatic logout when cookies are cleared
useEffect(() => {
  const checkAuth = () => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  };

  // Check every 5 minutes
  const interval = setInterval(checkAuth, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

## 🐛 Troubleshooting

### Cookies Not Persisting

1. **Check SameSite Setting**: Ensure `sameSite: 'lax'` is used
2. **Verify Path**: Cookies should have `path: '/'`
3. **Check Domain**: Ensure domain matches your frontend domain
4. **HTTPS Required**: In production, cookies need HTTPS for `secure: true`

### CORS Issues

1. **Include Credentials**: Always use `credentials: 'include'`
2. **Check Origin**: Ensure backend allows your frontend origin
3. **Preflight Requests**: Handle OPTIONS requests properly

### Debug Mode

```typescript
// Enable detailed logging
if (process.env.NODE_ENV === 'development') {
  console.log('🍪 Current cookies:', document.cookie);

  const authState = getAuthState();
  console.log('🔍 Auth state:', authState);

  // Monitor cookie changes
  const stopMonitoring = monitorCookieChanges();
}
```

## 📱 Mobile Considerations

### iOS Safari

- Cookies with `sameSite: 'none'` require `secure: true`
- Use `sameSite: 'lax'` for better compatibility

### Android Chrome

- Cookies work reliably with `sameSite: 'lax'`
- Ensure proper `maxAge` setting

## 🚀 Production Deployment

### Environment Variables

```bash
# Backend
NODE_ENV=production
COOKIE_DOMAIN=.yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

### HTTPS Requirements

- All cookies must use `secure: true` in production
- Domain must match exactly
- Use proper SSL certificates

## 📊 Testing

### Manual Testing

1. **Login**: Check if cookies are set
2. **Refresh**: Verify cookies persist
3. **Logout**: Ensure cookies are cleared
4. **Cross-tab**: Test cookie synchronization

### Automated Testing

```typescript
// Test cookie persistence
test('cookies persist after page refresh', () => {
  // Set test cookie
  setCookie('test', 'value');

  // Simulate page refresh
  const cookies = document.cookie;
  expect(cookies).toContain('test=value');
});
```

## 🎉 Success Checklist

- [ ] Cookies persist after page refresh
- [ ] Authentication state maintained across tabs
- [ ] Proper logout clears all cookies
- [ ] CORS configured correctly
- [ ] HTTPS enabled in production
- [ ] Error handling implemented
- [ ] Token refresh strategy in place
- [ ] Mobile compatibility verified

## 🔗 Additional Resources

- [MDN Cookies Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
- [SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [CORS with Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)
