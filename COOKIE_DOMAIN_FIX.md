# Cookie Domain Error Fix

## Problem Description

The application was encountering a `TypeError: option domain is invalid` error when trying to serialize cookies in the `AuthController.setAuthCookies` method. This error occurred because:

1. **Invalid Domain Format**: The `COOKIE_DOMAIN` environment variable was either undefined or contained an invalid domain format
2. **Missing Validation**: The cookie domain option was being passed directly to `res.cookie()` without validation
3. **Production vs Development**: The error only occurred in production when `COOKIE_DOMAIN` was set

## Error Details

```
TypeError: option domain is invalid
    at Object.serialize (/var/task/node_modules/cookie/index.js:217:13)
    at AuthController.setAuthCookies
```

## Root Cause

The issue was in the `setAuthCookies` and `clearAuthCookies` methods in `src/controllers/auth.controller.ts`:

```typescript
// BEFORE (Problematic Code)
const cookieOptions = {
  // ... other options
  domain:
    process.env.NODE_ENV === 'production'
      ? process.env.COOKIE_DOMAIN // Could be undefined or invalid
      : undefined,
};
```

## Solution Implemented

### 1. Created Cookie Utility Functions

Added new utility functions in `src/utils/cookie.utils.ts`:

- **`validateCookieDomain(domain)`**: Validates domain format and returns cleaned domain or undefined
- **`createSafeCookieOptions(options)`**: Creates safe cookie options with domain validation

### 2. Domain Validation Logic

The validation includes:

- **Format Check**: Uses regex to validate domain format
- **Leading Dot Removal**: Removes leading dots that some browsers don't like
- **Fallback**: Returns `undefined` for invalid domains (which is safe for cookies)

### 3. Updated AuthController

Refactored both `setAuthCookies` and `clearAuthCookies` methods to use the utility functions:

```typescript
// AFTER (Fixed Code)
private setAuthCookies(res: Response, token: string, userData: UserProfileDto) {
  const cookieOptions = createSafeCookieOptions({
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
  });

  res.cookie('auth-token', token, cookieOptions);
  res.cookie('user', JSON.stringify(userData), cookieOptions);
}
```

### 4. Environment Configuration

Updated `env.example` to include:

```bash
# Cookie Configuration (Production)
# COOKIE_DOMAIN=your-domain.com (only set in production)
```

## Benefits of the Fix

1. **Error Prevention**: Prevents cookie serialization errors
2. **Graceful Degradation**: Invalid domains fall back to undefined (safe default)
3. **Code Reusability**: Utility functions can be used across the application
4. **Better Logging**: Warns about invalid domains for debugging
5. **Maintainability**: Centralized domain validation logic

## Testing

The fix has been tested with:

- ✅ Valid domains: `example.com`, `sub.example.com`, `test-domain.com`
- ✅ Edge cases: `localhost`, `127.0.0.1`
- ❌ Invalid domains: `invalid..domain.com`, `domain.com.`, `.domain.com.`
- ✅ Empty/undefined values: `null`, `undefined`, `""`

## Usage Examples

### Setting Cookies with Domain Validation

```typescript
import { createSafeCookieOptions } from '../utils/cookie.utils';

const cookieOptions = createSafeCookieOptions({
  domain: process.env.COOKIE_DOMAIN,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

res.cookie('session', sessionId, cookieOptions);
```

### Manual Domain Validation

```typescript
import { validateCookieDomain } from '../utils/cookie.utils';

const safeDomain = validateCookieDomain(process.env.COOKIE_DOMAIN);
if (safeDomain) {
  // Use safe domain
} else {
  // Handle invalid domain case
}
```

## Security Considerations

1. **Domain Validation**: Prevents malicious domain injection
2. **Environment Isolation**: Production domains are separate from development
3. **Cookie Security**: Maintains `httpOnly`, `secure`, and `sameSite` settings
4. **Fallback Safety**: Invalid domains default to undefined (most restrictive)

## Deployment Notes

1. **Production**: Set `COOKIE_DOMAIN` to your actual domain (e.g., `yourdomain.com`)
2. **Development**: Leave `COOKIE_DOMAIN` undefined for local testing
3. **Vercel**: Ensure `COOKIE_DOMAIN` is set in your Vercel environment variables

## Related Files Modified

- `src/controllers/auth.controller.ts` - Updated cookie methods
- `src/utils/cookie.utils.ts` - Added validation utilities
- `env.example` - Added cookie domain configuration
- `vercel.env.example` - Already had cookie domain configuration

## Future Improvements

1. **Enhanced Validation**: Add support for internationalized domain names (IDN)
2. **Domain Whitelist**: Allow configuration of allowed domains
3. **Cookie Analytics**: Track cookie usage and validation failures
4. **Testing**: Add unit tests for cookie validation utilities

## Troubleshooting

If you still encounter cookie issues:

1. **Check Environment Variables**: Ensure `COOKIE_DOMAIN` is set correctly
2. **Validate Domain Format**: Use the test script to validate your domain
3. **Check Browser Console**: Look for cookie-related errors
4. **Verify HTTPS**: Ensure `secure: true` is appropriate for your setup

## References

- [Cookie Domain Specification](https://tools.ietf.org/html/rfc6265#section-5.2.3)
- [Express Cookie Documentation](https://expressjs.com/en/api.html#res.cookie)
- [NestJS Cookie Handling](https://docs.nestjs.com/techniques/cookies)
