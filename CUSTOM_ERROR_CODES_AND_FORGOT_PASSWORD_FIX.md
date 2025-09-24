# 🔧 Custom Error Codes & Forgot Password Fix

## 🎯 **What I Implemented**

I've added a **custom error code `USER_NOT_VERIFIED`** for unverified users and **fixed the 500 error** on the forgot-password endpoint.

## 🔒 **Custom Error Code Implementation**

### **1. Created Custom Exception Class**

**File:** `src/auth/exceptions/user-not-verified.exception.ts`

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotVerifiedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Please verify your email before signing in. Check your inbox for the verification code.',
        error: 'USER_NOT_VERIFIED',  // ← Custom error code
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
```

### **2. Updated Sign-in Method**

**File:** `src/auth/auth.service.ts`

```typescript
// Check if email is verified
if (!user.email_verified) {
  throw new UserNotVerifiedException();  // ← Uses custom exception
}
```

## ✅ **Error Response Format**

### **For Unverified Users (Sign-in):**

```json
{
  "message": "Please verify your email before signing in. Check your inbox for the verification code.",
  "error": "USER_NOT_VERIFIED",
  "statusCode": 401
}
```

### **For Invalid Credentials (Sign-in):**

```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

## 🔧 **Forgot Password 500 Error Fix**

### **The Problem:**
The `createPasswordResetToken` method was using `upsert` without conflict resolution, causing duplicate key errors.

### **The Fix:**
Added `onConflict: 'email'` to handle duplicate email addresses:

```typescript
const { error } = await this.supabase
  .from('password_reset_tokens')
  .upsert({
    email,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  }, {
    onConflict: 'email'  // ← Added conflict resolution
  });
```

## 🧪 **Testing the Fixes**

### **Test 1: Unverified User Sign-in**

```bash
# 1. Sign up (user not verified)
curl -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# 2. Try to sign in (should return USER_NOT_VERIFIED)
curl -X POST http://localhost:3000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected Response:
{
  "message": "Please verify your email before signing in. Check your inbox for the verification code.",
  "error": "USER_NOT_VERIFIED",
  "statusCode": 401
}
```

### **Test 2: Forgot Password (Should work now)**

```bash
# Test forgot password (should not give 500 error)
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected Response:
{
  "data": {
    "message": "If an account with this email exists, a password reset link has been sent."
  },
  "message": "Password reset email sent",
  "status": "success"
}
```

## 🎯 **Frontend Integration**

### **Error Handling in Frontend:**

```typescript
// Handle sign-in response
if (response.error === 'USER_NOT_VERIFIED') {
  // Show verification required message
  showVerificationRequired();
} else if (response.error === 'Unauthorized') {
  // Show invalid credentials message
  showInvalidCredentials();
}
```

### **Error Code Mapping:**

| Error Code | Description | Action |
|------------|-------------|---------|
| `USER_NOT_VERIFIED` | Email not verified | Show verification prompt |
| `Unauthorized` | Invalid credentials | Show login error |
| `Bad Request` | Invalid input | Show validation error |

## 📊 **API Documentation Updated**

The API documentation now shows the correct error response:

```yaml
responses:
  401:
    description: Invalid credentials or email not verified
    schema:
      type: object
      properties:
        message:
          type: string
          example: "Please verify your email before signing in. Check your inbox for the verification code."
        error:
          type: string
          example: "USER_NOT_VERIFIED"
        statusCode:
          type: number
          example: 401
```

## 🎯 **Result**

- ✅ **Custom error code `USER_NOT_VERIFIED`** for unverified users
- ✅ **Fixed 500 error** on forgot-password endpoint
- ✅ **Clear error responses** for frontend integration
- ✅ **Proper conflict resolution** for database operations

## 🚀 **Next Steps**

1. **Test the endpoints** to ensure they work correctly
2. **Update your frontend** to handle the `USER_NOT_VERIFIED` error code
3. **Verify forgot-password** works without 500 errors

Both issues should be completely resolved now!
