# 🍪 Cookie Configuration Guide for Flexify Backend

## Overview

This guide explains how to configure cookies in your Flexify backend to ensure they are visible and accessible to frontend JavaScript applications.

## 🎯 Key Requirements for Visible Cookies

### 1. **httpOnly: false**

- Cookies must have `httpOnly: false` to be accessible via JavaScript
- This allows `document.cookie` to read the cookie values

### 2. **secure: false in Development**

- In development, cookies should have `secure: false` to work over HTTP
- In production, set `secure: true` for HTTPS-only cookies

### 3. **sameSite: 'none' in Development**

- Use `sameSite: 'none'` for cross-origin requests in development
- Use `sameSite: 'lax'` in production for better security

### 4. **CORS Credentials Enabled**

- Must set `credentials: 'include'` in frontend fetch requests
- Backend must have `Access-Control-Allow-Credentials: true`

## 🔧 Current Configuration

### Cookie Utility Functions (`src/utils/cookie.utils.ts`)

```typescript
export function createSafeCookieOptions(options = {}) {
  return {
    httpOnly: false, // ✅ Allows JavaScript access
    secure: process.env.NODE_ENV === 'production', // ✅ HTTP in dev, HTTPS in prod
    sameSite: (process.env.NODE_ENV === 'production' ? 'lax' : 'none') as
      | 'lax'
      | 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    ...options,
    domain: validateCookieDomain(options.domain),
  };
}
```

### CORS Configuration (`src/main.ts`)

```typescript
app.enableCors({
  origin: true, // Allow all origins
  credentials: true, // ✅ Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    /* ... */
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Total-Count'],
});
```

## 🧪 Testing Endpoints

### 1. Basic Cookie Test

- **Endpoint**: `GET /api/v1/test-cookie`
- **Purpose**: Tests basic cookie functionality
- **Cookie**: Sets `simple-test` cookie

### 2. Auth Cookie Test

- **Endpoint**: `GET /api/v1/auth/test-cookies`
- **Purpose**: Tests auth-related cookie functionality
- **Cookies**: Sets `test-cookie` and `debug-cookie`

### 3. Sign-In Test

- **Endpoint**: `POST /api/v1/auth/sign-in`
- **Purpose**: Tests actual authentication cookies
- **Cookies**: Sets `auth-token` and `user` cookies

## 🎨 Frontend Testing

### HTML Test Page (`cors-test.html`)

The test page includes:

- **Cookie Testing Section**: Test cookie setting and visibility
- **Cookie Display**: Shows current cookies in real-time
- **Clear Function**: Removes test cookies

### JavaScript Cookie Testing

```javascript
// Test basic cookie
async function testBasicCookie() {
  const response = await fetch('/api/v1/test-cookie', {
    credentials: 'include', // ✅ Essential for cookies
    headers: { 'Content-Type': 'application/json' },
  });
}

// Check cookies
function checkCookies() {
  const cookies = document.cookie;
  console.log('Current cookies:', cookies);
}
```

## 🔍 Debugging Cookie Issues

### 1. Check Browser Dev Tools

- **Application Tab** > **Cookies** > **Your Domain**
- Look for cookies with correct settings

### 2. Console Logging

- Backend logs cookie creation details
- Frontend shows cookie visibility status

### 3. Common Issues

#### Cookies Not Visible

- Check `httpOnly: false`
- Verify `credentials: 'include'` in fetch
- Ensure CORS credentials enabled

#### Cookies Not Persisting

- Check `maxAge` or `expires` settings
- Verify `path` is correct
- Check `domain` settings

#### Cross-Origin Issues

- Verify `sameSite` settings
- Check CORS configuration
- Ensure proper origin handling

## 🚀 Production Deployment

### Environment Variables

```bash
# Production
NODE_ENV=production
COOKIE_DOMAIN=yourdomain.com

# Development
NODE_ENV=development
# COOKIE_DOMAIN not set (uses current domain)
```

### Cookie Security in Production

```typescript
// Production settings
{
  httpOnly: false, // Still allow JavaScript access
  secure: true,    // HTTPS only
  sameSite: 'lax', // CSRF protection
  domain: 'yourdomain.com' // Production domain
}
```

## 📱 Frontend Integration

### React/Next.js Example

```typescript
// API client with credentials
const apiClient = {
  async request(url: string, options: RequestInit = {}) {
    return fetch(url, {
      ...options,
      credentials: 'include', // Essential for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  },
};

// Usage
const response = await apiClient.request('/api/v1/auth/sign-in', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
```

### Vue.js Example

```typescript
// Axios configuration
const axiosInstance = axios.create({
  withCredentials: true, // Essential for cookies
  baseURL: '/api/v1',
});

// Usage
const response = await axiosInstance.post('/auth/sign-in', {
  email,
  password,
});
```

## 🧹 Cookie Management

### Setting Cookies

```typescript
// Backend sets cookies automatically
res.cookie('auth-token', token, cookieOptions);
res.cookie('user', JSON.stringify(userData), cookieOptions);
```

### Reading Cookies

```typescript
// Frontend reads cookies
const token = getCookie('auth-token');
const userData = JSON.parse(getCookie('user') || '{}');
```

### Clearing Cookies

```typescript
// Backend clears cookies
res.clearCookie('auth-token', cookieOptions);
res.clearCookie('user', cookieOptions);

// Frontend can also clear
document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
```

## 🔒 Security Considerations

### 1. **XSS Protection**

- Cookies are accessible to JavaScript (by design)
- Sanitize user input to prevent XSS attacks
- Consider using `httpOnly: true` for sensitive tokens if JavaScript access isn't needed

### 2. **CSRF Protection**

- `sameSite: 'lax'` provides basic CSRF protection
- Consider additional CSRF tokens for sensitive operations

### 3. **Secure Transmission**

- Always use `secure: true` in production
- Ensure HTTPS is properly configured

## 📋 Testing Checklist

- [ ] Basic cookie endpoint works (`/api/v1/test-cookie`)
- [ ] Auth cookie endpoint works (`/api/v1/auth/test-cookies`)
- [ ] Cookies are visible in browser dev tools
- [ ] Cookies are accessible via `document.cookie`
- [ ] CORS preflight requests succeed
- [ ] Credentials are included in requests
- [ ] Cookies persist across page reloads
- [ ] Cookies are cleared properly on logout

## 🆘 Troubleshooting

### Still Can't See Cookies?

1. **Check Network Tab**: Look for `Set-Cookie` headers in response
2. **Verify CORS**: Ensure `Access-Control-Allow-Credentials: true`
3. **Check Domain**: Verify cookie domain matches your setup
4. **Browser Settings**: Check if cookies are blocked
5. **HTTPS Issues**: Ensure proper SSL configuration in production

### Cookies Not Working in Production?

1. **Environment Variables**: Verify `NODE_ENV` and `COOKIE_DOMAIN`
2. **HTTPS**: Ensure `secure: true` is appropriate
3. **Domain**: Check if domain matches your production URL
4. **CORS**: Verify production CORS settings

## 📚 Additional Resources

- [MDN Cookie Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Express Cookie Documentation](https://expressjs.com/en/api.html#res.cookie)
- [NestJS Cookie Handling](https://docs.nestjs.com/techniques/cookies)
- [CORS Credentials Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#credentials)

---

**Note**: This configuration prioritizes frontend accessibility while maintaining security best practices. Adjust settings based on your specific security requirements.
