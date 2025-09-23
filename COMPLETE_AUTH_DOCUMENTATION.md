# 🔐 Complete Authentication System Documentation

## 🚀 **System Overview**

This comprehensive documentation covers all authentication flows, error cases, security features, and implementation details for the Flexify authentication system.

## 📋 **All Authentication Scenarios**

### **Scenario 1: New User Registration**

```
1. User fills sign-up form
2. System validates input data
3. System checks if email already exists
4. System generates 5-digit OTP
5. System sends OTP email
6. User receives OTP in email
7. User enters OTP to verify account
8. Account is created and verified
9. User can now sign in
```

### **Scenario 2: Existing User Sign-in**

```
1. User enters email and password
2. System validates credentials
3. System checks if user exists and is active
4. System verifies password
5. System generates access token (15 min)
6. System generates refresh token (7 days)
7. System creates session record
8. User is authenticated
9. User can access protected routes
```

### **Scenario 3: Forgot Password**

```
1. User clicks "Forgot Password"
2. User enters email address
3. System checks if user exists (security: no reveal)
4. System generates secure reset token
5. System sends password reset email
6. User clicks link in email
7. User enters new password twice
8. System validates password match
9. System updates password
10. All sessions are invalidated
11. User must sign in with new password
```

### **Scenario 4: Token Refresh**

```
1. Access token expires (15 minutes)
2. Frontend detects token expiry
3. Frontend automatically uses refresh token
4. System validates refresh token
5. System generates new access token
6. System generates new refresh token
7. Old refresh token is invalidated
8. User continues using application
```

### **Scenario 5: Account Verification**

```
1. User requests new OTP
2. System checks if user exists
3. System generates new 5-digit OTP
4. System sends OTP email
5. User enters OTP
6. System verifies OTP
7. Account verification status updated
```

### **Scenario 6: Password Change (Authenticated User)**

```
1. User is signed in
2. User requests password change
3. User enters current password
4. System verifies current password
5. User enters new password twice
6. System validates password match
7. System validates password strength
8. Password is updated
9. All sessions are invalidated
10. User must sign in again
```

### **Scenario 7: Sign Out**

```
1. User clicks sign out
2. System invalidates all user sessions
3. System invalidates all refresh tokens
4. User is signed out from all devices
5. User must sign in again
```

### **Scenario 8: Session Expiry**

```
1. Access token expires (15 minutes)
2. Refresh token is used to get new tokens
3. If refresh token expires (7 days)
4. User must sign in again
5. If user is inactive, session is cleaned up
```

## 🔧 **Complete API Endpoints**

### **Base URL**: `http://localhost:3000/api/v1`

### **1. User Registration**

#### **Sign Up**

```http
POST /api/v1/auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Success Response (201):**

```json
{
  "data": {
    "message": "OTP sent to your email. Please verify your account."
  },
  "message": "OTP sent successfully",
  "status": "success"
}
```

**Error Cases:**

- **400**: Invalid input data
- **409**: User already exists with this email
- **500**: Email service unavailable

#### **Verify Account**

```http
POST /api/v1/auth/verify-account
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "12345"
}
```

**Success Response (200):**

```json
{
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User",
      "email_verified": true,
      "role": "USER",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Account verified successfully",
  "status": "success"
}
```

**Error Cases:**

- **400**: Invalid or expired OTP
- **404**: User not found
- **500**: Database error

#### **Send OTP**

```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "data": {
    "message": "OTP sent to your email"
  },
  "message": "OTP sent successfully",
  "status": "success"
}
```

**Error Cases:**

- **400**: User not found
- **500**: Email service unavailable

### **2. User Authentication**

#### **Sign In**

```http
POST /api/v1/auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "email_verified": true,
      "role": "USER",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "session": {
      "isActive": true,
      "expiresAt": "2024-01-01T00:15:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  },
  "message": "User signed in successfully",
  "status": "success"
}
```

**Error Cases:**

- **400**: Invalid input data
- **401**: Invalid credentials
- **401**: Account is deactivated
- **500**: Database error

#### **Sign Out**

```http
POST /api/v1/auth/sign-out
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "data": null,
  "message": "User signed out successfully",
  "status": "success"
}
```

**Error Cases:**

- **401**: Unauthorized (invalid token)
- **500**: Database error

### **3. Password Management**

#### **Forgot Password**

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "data": {
    "message": "If an account with this email exists, a password reset link has been sent."
  },
  "message": "Password reset email sent",
  "status": "success"
}
```

**Error Cases:**

- **400**: Invalid email format
- **500**: Email service unavailable

#### **Reset Password with Token**

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "newPassword123",
  "confirm_password": "newPassword123"
}
```

**Success Response (200):**

```json
{
  "data": {
    "message": "Password reset successfully. Please sign in with your new password."
  },
  "message": "Password reset successfully",
  "status": "success"
}
```

**Error Cases:**

- **400**: Invalid or expired token
- **400**: Passwords do not match
- **400**: Invalid password format
- **500**: Database error

#### **Change Password (Authenticated)**

```http
PUT /api/v1/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "currentPassword123",
  "new_password": "newPassword123",
  "confirm_password": "newPassword123"
}
```

**Success Response (200):**

```json
{
  "data": null,
  "message": "Password changed successfully. You have been signed out for security reasons.",
  "status": "success"
}
```

**Error Cases:**

- **400**: Current password is incorrect
- **400**: Passwords do not match
- **400**: New password same as current
- **401**: Unauthorized
- **500**: Database error

### **4. Token Management**

#### **Refresh Token**

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

**Success Response (200):**

```json
{
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token"
  },
  "message": "Tokens refreshed successfully",
  "status": "success"
}
```

**Error Cases:**

- **400**: Invalid refresh token format
- **401**: Invalid or expired refresh token
- **500**: Database error

### **5. User Profile Management**

#### **Get Current User**

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "email_verified": true,
    "role": "USER",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "User retrieved successfully",
  "status": "success"
}
```

**Error Cases:**

- **401**: Unauthorized
- **404**: User not found
- **500**: Database error

#### **Update Profile**

```http
PUT /api/v1/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "bio": "Software developer with 5+ years experience"
}
```

**Success Response (200):**

```json
{
  "data": {
    "id": "user-id",
    "email": "john.smith@example.com",
    "name": "John Smith",
    "bio": "Software developer with 5+ years experience",
    "email_verified": true,
    "role": "USER",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Profile updated successfully",
  "status": "success"
}
```

**Error Cases:**

- **400**: Invalid input data
- **400**: Email already taken
- **401**: Unauthorized
- **500**: Database error

## 🚨 **Error Handling**

### **Common Error Responses**

#### **400 Bad Request**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

#### **401 Unauthorized**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### **403 Forbidden**

```json
{
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden"
}
```

#### **404 Not Found**

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### **409 Conflict**

```json
{
  "statusCode": 409,
  "message": "User already exists with this email",
  "error": "Conflict"
}
```

#### **500 Internal Server Error**

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## 🔒 **Security Features**

### **Password Security**

- bcrypt hashing with 12 salt rounds
- Minimum 8 characters required
- Password confirmation validation
- Secure password reset flow

### **Token Security**

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Token rotation on refresh
- Secure token storage

### **Email Security**

- OTP codes expire in 10 minutes
- Password reset tokens expire in 1 hour
- Single-use tokens
- No user enumeration

### **Session Security**

- Session tracking with IP and User-Agent
- Automatic session cleanup
- Force logout capability
- Secure session management

## 📱 **Frontend Integration Examples**

### **Registration Flow**

```javascript
// 1. Sign up
const signUpResponse = await fetch('/api/v1/auth/sign-up', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'securePassword123',
  }),
});

// 2. Verify account
const verifyResponse = await fetch('/api/v1/auth/verify-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '12345',
  }),
});
```

### **Sign In Flow**

```javascript
// Sign in
const signInResponse = await fetch('/api/v1/auth/sign-in', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
  }),
});

const { data } = await signInResponse.json();
// Store tokens securely
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

### **Token Refresh Flow**

```javascript
// Automatic token refresh
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');

  const response = await fetch('/api/v1/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.ok) {
    const { data } = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  } else {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### **Protected API Calls**

```javascript
// Make authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshToken();
    // Retry the request
    return makeAuthenticatedRequest(url, options);
  }

  return response;
}
```

## 🧪 **Testing Scenarios**

### **Happy Path Tests**

1. ✅ User registration with valid data
2. ✅ OTP verification with correct code
3. ✅ User sign-in with valid credentials
4. ✅ Token refresh before expiry
5. ✅ Password reset with valid token
6. ✅ Profile update with valid data

### **Error Path Tests**

1. ❌ Registration with existing email
2. ❌ OTP verification with wrong code
3. ❌ Sign-in with invalid credentials
4. ❌ Token refresh with expired token
5. ❌ Password reset with invalid token
6. ❌ Profile update with invalid data

### **Security Tests**

1. 🔒 OTP expiry after 10 minutes
2. 🔒 Password reset token expiry after 1 hour
3. 🔒 Access token expiry after 15 minutes
4. 🔒 Refresh token expiry after 7 days
5. 🔒 Session invalidation on password change
6. 🔒 Force logout functionality

## 📊 **Monitoring and Logging**

### **Key Metrics to Monitor**

- Registration success rate
- OTP verification success rate
- Sign-in success rate
- Token refresh frequency
- Password reset completion rate
- Session duration
- Error rates by endpoint

### **Logging Requirements**

- All authentication attempts
- Token generation and validation
- Password changes
- Session creation and destruction
- Email delivery status
- Security events

## 🚀 **Deployment Checklist**

### **Environment Variables**

- [ ] SUPABASE_URL configured
- [ ] SUPABASE_SERVICE_KEY configured
- [ ] JWT_SECRET configured
- [ ] JWT_REFRESH_SECRET configured
- [ ] EMAIL_HOST configured
- [ ] EMAIL_USER configured
- [ ] EMAIL_PASSWORD configured
- [ ] APP_FRONTEND_URL configured

### **Database Setup**

- [ ] Run migration: `database/16-add-auth-tables.sql`
- [ ] Verify all tables created
- [ ] Test database connections
- [ ] Verify RLS policies

### **Email Configuration**

- [ ] SMTP credentials configured
- [ ] Test email delivery
- [ ] Verify email templates
- [ ] Check spam folder settings

### **Security Checklist**

- [ ] HTTPS enabled in production
- [ ] Secure cookie settings
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Error messages sanitized

## 📞 **Support and Troubleshooting**

### **Common Issues**

1. **Email not sending**: Check SMTP configuration
2. **Token validation errors**: Verify JWT secrets
3. **Database connection issues**: Check Supabase configuration
4. **CORS errors**: Verify allowed origins
5. **Session issues**: Check cookie settings

### **Debug Endpoints**

- `GET /api/v1/auth/debug-cookies` - Check cookie information
- Check application logs for detailed error messages
- Use Swagger documentation for API testing

This comprehensive documentation covers all authentication scenarios, error cases, and implementation details for the Flexify authentication system.
