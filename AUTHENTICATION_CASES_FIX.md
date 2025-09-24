# 🔐 Authentication Cases Fix

## 🎯 **Problem Solved**

Fixed the authentication flow to properly handle three distinct cases:

1. **Case 1**: User registers but not verified → User should need to verify
2. **Case 2**: User registers and needs sign-in but not verified → Custom message "ACCOUNT_NOT_VERIFIED"
3. **Case 3**: User not registered before and not have an account → Error message "ACCOUNT_NOT_FOUND"

## 🔧 **Changes Made**

### **1. Database Schema Updates**

**File:** `database/17-add-pending-signups.sql`

- Added `pending_signups` table to store user data before verification
- Stores: email, name, password_hash, created_at, expires_at
- 24-hour expiration for pending signups
- Proper indexing for performance

### **2. New Exception Classes**

**File:** `src/auth/exceptions/account-not-verified.exception.ts`

```typescript
export class AccountNotVerifiedException extends HttpException {
  constructor() {
    super(
      {
        message:
          'Account not verified. Please verify your email before signing in.',
        error: 'ACCOUNT_NOT_VERIFIED',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
```

### **3. Enhanced SupabaseService**

**File:** `src/supabase/supabase.service.ts`

Added new methods:

- `createPendingSignup()` - Store user data before verification
- `getPendingSignup()` - Retrieve pending signup data
- `deletePendingSignup()` - Clean up after verification
- `deleteOtpRecord()` - Clean up OTP records
- `hashPassword()` - Hash passwords securely

### **4. Updated Authentication Flow**

**File:** `src/auth/auth.service.ts`

#### **Sign-up Process (Case 1):**

1. Check if user already exists
2. Hash password securely
3. Store user data in `pending_signups` table
4. Generate and send OTP
5. User must verify before account is created

#### **Sign-in Process (All Cases):**

```typescript
// Case 3: User not registered before and not have an account
if (!user) {
  throw new AccountNotFoundException(); // "ACCOUNT_NOT_FOUND"
}

// Case 2: User exists but not verified
if (!user.email_verified) {
  throw new AccountNotVerifiedException(); // "ACCOUNT_NOT_VERIFIED"
}

// Case 1: Normal verified user login
// Continue with normal authentication flow
```

#### **Verification Process:**

1. Verify OTP
2. Get pending signup data
3. Create user with stored data (name, password)
4. Mark email as verified
5. Clean up pending signup and OTP records

## ✅ **Error Response Format**

### **Case 1: User registers but not verified (Sign-in attempt)**
- **Action**: Automatically sends OTP to user's email
- **Response**: 
```json
{
  "message": "Account not verified. Please verify your email before signing in.",
  "error": "ACCOUNT_NOT_VERIFIED",
  "statusCode": 401
}
```

### **Case 2: User exists but not verified (Sign-in attempt)**
- **Action**: Automatically sends OTP to user's email
- **Response**: 
```json
{
  "message": "Account not verified. Please verify your email before signing in.",
  "error": "ACCOUNT_NOT_VERIFIED",
  "statusCode": 401
}
```

### **Case 3: User not registered (Sign-in attempt)**

```json
{
  "message": "Account not found. Please check your email or sign up for a new account.",
  "error": "ACCOUNT_NOT_FOUND",
  "statusCode": 404
}
```

## 🔄 **Complete Authentication Flow**

### **New User Registration:**

1. **Sign-up** → Store in `pending_signups` + Send OTP
2. **Verify Account** → Create user + Mark verified + Clean up
3. **Sign-in** → Normal authentication

### **Existing User Sign-in:**

1. **Check if user exists** → If not, check pending signups
2. **If pending signup exists** → Case 1: ACCOUNT_NOT_VERIFIED
3. **If user exists but not verified** → Case 2: ACCOUNT_NOT_VERIFIED
4. **If no user and no pending signup** → Case 3: ACCOUNT_NOT_FOUND
5. **If user exists and verified** → Normal login

### **Resend OTP:**

- Works for both verified users and pending signups
- Uses appropriate name from user record or pending signup

## 🛡️ **Security Improvements**

- Passwords are hashed before storage in pending signups
- Pending signups expire after 24 hours
- OTP records are cleaned up after verification
- Proper error handling for all edge cases
- No temporary passwords or insecure data storage

## 📋 **Database Tables**

### **pending_signups**

- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `name` (VARCHAR)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP)

### **users** (existing)

- `email_verified` (BOOLEAN) - Used to determine verification status

### **otp_verifications** (existing)

- Used for OTP storage and verification

## 🎉 **Result**

All three authentication cases now work correctly:

1. ✅ **Case 1**: User registers → Must verify → Can sign in
2. ✅ **Case 2**: User exists but not verified → ACCOUNT_NOT_VERIFIED error
3. ✅ **Case 3**: User not registered → ACCOUNT_NOT_FOUND error

The authentication system now provides clear, specific error messages for each scenario and handles the complete user journey from registration to verification to login.
