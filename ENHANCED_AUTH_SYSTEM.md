# 🔐 Enhanced Authentication System

## 🚀 **New Authentication Flow**

This document describes the enhanced authentication system with email verification, password reset, and improved token management.

## 📋 **Authentication Flow Overview**

### **1. User Registration Flow**

```
Sign-up → Send OTP (5-digit) → Verify Account → Sign-in
```

### **2. Password Reset Flow**

```
Forgot Password → Send Reset Email → Enter New Password with Token → Sign-in
```

### **3. Token Management**

- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **OTP**: 10 minutes expiration
- **Password Reset Token**: 1 hour expiration

## 🔧 **New API Endpoints**

### **Authentication Endpoints**

#### **1. Sign Up (Modified)**

```http
POST /auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "data": {
    "message": "OTP sent to your email. Please verify your account."
  },
  "message": "OTP sent successfully",
  "status": "success"
}
```

#### **2. Verify Account**

```http
POST /auth/verify-account
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "12345"
}
```

**Response:**

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

#### **3. Send OTP**

```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### **4. Forgot Password**

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "data": {
    "message": "If an account with this email exists, a password reset link has been sent."
  },
  "message": "Password reset email sent",
  "status": "success"
}
```

#### **5. Reset Password with Token**

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "newPassword123",
  "confirm_password": "newPassword123"
}
```

#### **6. Refresh Token**

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

**Response:**

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

#### **7. Sign In (Enhanced)**

```http
POST /auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

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

## 🗄️ **Database Schema**

### **New Tables Added**

#### **1. OTP Verifications**

```sql
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(5) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);
```

#### **2. Password Reset Tokens**

```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);
```

#### **3. Refresh Tokens**

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📧 **Email Configuration**

### **Environment Variables**

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@flexify.com

# Application Configuration
APP_FRONTEND_URL=https://your-frontend.com
```

### **Email Templates**

#### **OTP Email Template**

- Professional HTML design
- 5-digit OTP prominently displayed
- 10-minute expiration notice
- Branded with Flexify styling

#### **Password Reset Email Template**

- Professional HTML design
- Secure reset link
- 1-hour expiration notice
- Branded with Flexify styling

## 🔒 **Security Features**

### **Token Security**

- **Access Tokens**: 15-minute expiration for enhanced security
- **Refresh Tokens**: 7-day expiration with rotation
- **OTP Codes**: 10-minute expiration
- **Password Reset**: 1-hour expiration

### **Password Security**

- bcrypt hashing with 12 salt rounds
- Password confirmation validation
- Secure password reset flow

### **Email Security**

- OTP codes are single-use
- Reset tokens are single-use
- No user enumeration in forgot password

## 🚀 **Implementation Steps**

### **1. Database Migration**

```bash
# Run the database migration
psql -d your_database -f database/16-add-auth-tables.sql
```

### **2. Environment Configuration**

```env
# Add to your .env file
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@flexify.com
APP_FRONTEND_URL=https://your-frontend.com
```

### **3. Install Dependencies**

```bash
# Dependencies are already included in package.json
npm install
```

### **4. Start the Application**

```bash
npm run start:dev
```

## 📱 **Frontend Integration**

### **Registration Flow**

1. User fills sign-up form
2. Call `/auth/sign-up` → Get OTP sent message
3. User enters OTP → Call `/auth/verify-account`
4. Account verified → Redirect to sign-in

### **Password Reset Flow**

1. User clicks "Forgot Password"
2. Enter email → Call `/auth/forgot-password`
3. User clicks link in email → Enter new password
4. Call `/auth/reset-password` with token
5. Password reset → Redirect to sign-in

### **Token Management**

1. Store access token and refresh token
2. Use access token for API calls
3. When access token expires, use refresh token
4. Call `/auth/refresh-token` to get new tokens

## 🔧 **Maintenance**

### **Cleanup Expired Records**

```sql
-- Clean expired OTP records
SELECT clean_expired_otp();

-- Clean expired password reset tokens
SELECT clean_expired_password_reset_tokens();

-- Clean expired refresh tokens
SELECT clean_expired_refresh_tokens();

-- Clean all expired auth records
SELECT clean_expired_auth_records();
```

### **Monitoring**

- Monitor email delivery rates
- Track OTP verification success rates
- Monitor token refresh patterns
- Set up alerts for failed authentication attempts

## 🎯 **Benefits**

### **Enhanced Security**

- ✅ Email verification prevents fake accounts
- ✅ Short-lived access tokens reduce attack surface
- ✅ Secure password reset flow
- ✅ Token rotation prevents replay attacks

### **Better User Experience**

- ✅ Clear authentication flow
- ✅ Professional email templates
- ✅ Secure password recovery
- ✅ Seamless token refresh

### **Developer Experience**

- ✅ Well-documented API endpoints
- ✅ Comprehensive error handling
- ✅ Easy frontend integration
- ✅ Automated cleanup functions

## 🚨 **Important Notes**

1. **Email Configuration**: Ensure SMTP credentials are properly configured
2. **Frontend URL**: Update `APP_FRONTEND_URL` for password reset links
3. **Token Storage**: Store tokens securely on the frontend
4. **Error Handling**: Implement proper error handling for all flows
5. **Rate Limiting**: Consider implementing rate limiting for OTP and password reset

## 📞 **Support**

For any issues or questions regarding the enhanced authentication system, please refer to the API documentation or contact the development team.
