# 🌐 CORS Configuration Guide - Flexify Backend

## Overview

This document explains the CORS (Cross-Origin Resource Sharing) configuration implemented in the Flexify Backend to allow any domain to access the API globally.

## 🏗️ Architecture

The CORS configuration is implemented at multiple levels for maximum compatibility:

### 1. Application Level (main.ts)
- **Global CORS enabled** with `origin: true` to allow all origins
- **Credentials enabled** for cross-origin requests (cookies, authorization headers)
- **All HTTP methods** allowed: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
- **Comprehensive headers** allowed including custom headers
- **Preflight caching** enabled for 24 hours

### 2. Middleware Level (cors.middleware.ts)
- **Custom CORS middleware** for fine-grained control
- **Dynamic origin handling** based on request headers
- **Preflight request handling** for OPTIONS requests
- **Header exposure** for Set-Cookie and Authorization

### 3. Serverless Level (Vercel handler)
- **Enhanced CORS headers** for serverless environments
- **Origin-specific responses** for better security
- **Comprehensive header support** for all CORS scenarios

## 🔧 Configuration Details

### CORS Options

```typescript
app.enableCors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'X-Forwarded-For',
    'X-Forwarded-Proto',
    'X-Forwarded-Host',
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours
});
```

### Allowed Headers

- **Standard Headers**: Origin, Content-Type, Accept, Authorization
- **Custom Headers**: X-API-Key, Cache-Control
- **CORS Headers**: All Access-Control-* headers
- **Proxy Headers**: X-Forwarded-For, X-Forwarded-Proto, X-Forwarded-Host

### Exposed Headers

- **Set-Cookie**: For authentication cookies
- **Authorization**: For JWT tokens
- **X-Total-Count**: For pagination metadata

## 🧪 Testing CORS

### 1. Using the Test HTML File

1. **Open** `cors-test.html` in your browser
2. **Ensure** your backend is running on the specified port
3. **Click** test buttons to verify CORS functionality
4. **Check** browser console for detailed CORS information

### 2. Manual Testing with cURL

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v http://localhost:3000/api/v1/health

# Test actual request
curl -X GET \
  -H "Origin: http://localhost:3001" \
  -H "Content-Type: application/json" \
  -v http://localhost:3000/api/v1/health
```

### 3. Browser Developer Tools

1. **Open** Developer Tools (F12)
2. **Go to** Network tab
3. **Make** a request from a different origin
4. **Check** response headers for CORS information

## 🚀 Environment Variables

### Development
- CORS is enabled globally for all origins
- No environment variables required

### Production
- CORS is still enabled globally
- Can be restricted using `ALLOWED_ORIGINS` if needed

```bash
# Optional: Restrict origins in production
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 🔒 Security Considerations

### What This Configuration Allows
- ✅ **Any domain** can access your API
- ✅ **Credentials** are allowed (cookies, auth headers)
- ✅ **All HTTP methods** are permitted
- ✅ **Custom headers** are supported

### Security Implications
- ⚠️ **Public API**: Anyone can make requests to your API
- ⚠️ **Credential exposure**: Cookies and auth headers are accessible
- ⚠️ **Method exposure**: All HTTP methods are available

### Recommendations for Production
1. **Implement proper authentication** for sensitive endpoints
2. **Use rate limiting** to prevent abuse
3. **Validate all inputs** to prevent injection attacks
4. **Monitor API usage** for suspicious activity
5. **Consider restricting origins** if you know your frontend domains

## 🐛 Troubleshooting

### Common CORS Issues

#### 1. Preflight Request Failing
**Symptoms**: OPTIONS request returns 404 or CORS error
**Solution**: Ensure OPTIONS method is handled and CORS middleware is applied

#### 2. Credentials Not Working
**Symptoms**: Cookies not sent or received
**Solution**: Verify `credentials: true` is set and `Access-Control-Allow-Credentials` header is present

#### 3. Custom Headers Blocked
**Symptoms**: Custom headers not received by server
**Solution**: Add custom headers to `allowedHeaders` array

#### 4. Origin Not Allowed
**Symptoms**: "Origin not allowed" error
**Solution**: Check that `origin: true` is set or your domain is in `allowedOrigins`

### Debug Steps

1. **Check browser console** for CORS error messages
2. **Verify response headers** in Network tab
3. **Test with cURL** to isolate browser vs server issues
4. **Check server logs** for CORS-related errors
5. **Verify middleware order** in app.module.ts

## 📚 Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [NestJS CORS Documentation](https://docs.nestjs.com/techniques/security#cors)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)

## 🎯 Next Steps

1. **Test** CORS functionality using the provided test file
2. **Verify** all your frontend domains can access the API
3. **Monitor** API usage and implement security measures as needed
4. **Consider** implementing rate limiting and request validation
5. **Document** any domain-specific CORS requirements

---

**Note**: This configuration allows maximum flexibility for development and testing. For production deployments, consider implementing additional security measures based on your specific requirements.
