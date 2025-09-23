# 🔧 OTP Duplicate Key Error Fix

## 🚨 **The Error You Encountered**

```
[Nest] 4  - 09/23/2025, 11:45:16 PM  ERROR [SupabaseService] Error creating OTP record: duplicate key value violates unique constraint "otp_verifications_email_key"
```

This error was giving you a **500 Internal Server Error** when trying to resend OTP.

## 🔍 **Root Cause Analysis**

The issue was in the `createOtpRecord` method in `src/supabase/supabase.service.ts`:

### **The Problem:**

1. **Database Constraint**: The `otp_verifications` table has a `UNIQUE(email)` constraint
2. **Upsert Without Conflict Resolution**: The `upsert` operation wasn't specifying how to handle conflicts
3. **Duplicate Email**: When resending OTP, it tried to insert a new record with the same email

### **Database Schema:**

```sql
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(5) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)  -- ← This was causing the conflict
);
```

## ✅ **The Fix**

### **Before (❌ Broken):**

```typescript
const { error } = await this.supabase.from('otp_verifications').upsert({
  email,
  otp,
  expires_at: expiresAt.toISOString(),
  created_at: new Date().toISOString(),
});
// ❌ No conflict resolution specified
```

### **After (✅ Fixed):**

```typescript
const { error } = await this.supabase.from('otp_verifications').upsert(
  {
    email,
    otp,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    onConflict: 'email', // ✅ Handle conflicts on email field
  },
);
```

## 🔄 **How It Works Now**

### **First OTP Request:**

1. **Insert**: Creates new OTP record
2. **Result**: ✅ Success

### **Resend OTP Request:**

1. **Upsert with Conflict Resolution**:
   - If email exists → **Update** the existing record
   - If email doesn't exist → **Insert** new record
2. **Result**: ✅ Success (no more duplicate key error)

## 🧪 **Testing the Fix**

### **Test Scenario:**

1. **Sign up** with an email
2. **Resend OTP** multiple times
3. **Should work** without any 500 errors

### **Expected Behavior:**

- ✅ **First OTP**: Creates new record
- ✅ **Resend OTP**: Updates existing record with new OTP
- ✅ **Multiple Resends**: Each resend updates the OTP and expiration time

## 📊 **Database Operations**

### **Before Fix:**

```sql
-- First request
INSERT INTO otp_verifications (email, otp, expires_at) VALUES ('user@example.com', '12345', '2025-01-23 23:55:16');

-- Resend request (❌ FAILS)
INSERT INTO otp_verifications (email, otp, expires_at) VALUES ('user@example.com', '67890', '2025-01-23 23:55:16');
-- ERROR: duplicate key value violates unique constraint "otp_verifications_email_key"
```

### **After Fix:**

```sql
-- First request
INSERT INTO otp_verifications (email, otp, expires_at) VALUES ('user@example.com', '12345', '2025-01-23 23:55:16');

-- Resend request (✅ SUCCESS)
INSERT INTO otp_verifications (email, otp, expires_at) VALUES ('user@example.com', '67890', '2025-01-23 23:55:16')
ON CONFLICT (email) DO UPDATE SET
  otp = EXCLUDED.otp,
  expires_at = EXCLUDED.expires_at,
  created_at = EXCLUDED.created_at;
```

## 🎯 **Result**

- ✅ **No more 500 errors** when resending OTP
- ✅ **OTP resend works** for both new and existing users
- ✅ **Database integrity maintained** with proper conflict resolution
- ✅ **User experience improved** - no more server errors

The duplicate key constraint error should be completely resolved now!
