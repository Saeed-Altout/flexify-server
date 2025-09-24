# 🚀 Vercel Deployment Fix

## 🚨 **The Problem**

You're getting a **500 error** on the production forgot-password endpoint:

```
https://flexify-server.vercel.app/api/v1/auth/forgot-password
```

This is the **same duplicate key constraint issue** we fixed locally, but it's happening in production.

## 🔍 **Root Cause**

The production database has the same unique constraint:

```sql
CREATE TABLE password_reset_tokens (
    -- ...
    email VARCHAR(255) NOT NULL,
    -- ...
    UNIQUE(email)  -- ← This causes the duplicate key error
);
```

When a user tries to reset their password multiple times, it tries to insert a duplicate email, causing the 500 error.

## ✅ **The Fix (Already Implemented Locally)**

We fixed this in `src/supabase/supabase.service.ts`:

```typescript
const { error } = await this.supabase.from('password_reset_tokens').upsert(
  {
    email,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    onConflict: 'email', // ← This handles the duplicate email issue
  },
);
```

## 🚀 **Deployment Steps**

### **Step 1: Deploy the Fix to Vercel**

```bash
# Make sure you're in the project directory
cd E:\working\flexify\flexify-server

# Commit the changes
git add .
git commit -m "Fix: Add conflict resolution for password reset tokens"

# Push to your repository
git push origin main
```

### **Step 2: Vercel Auto-Deploy**

If you have Vercel connected to your GitHub repository, it should automatically deploy the changes.

### **Step 3: Manual Deploy (if needed)**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

## 🧪 **Testing the Fix**

### **Test the Production Endpoint:**

```bash
# Test forgot password on production
curl -X POST https://flexify-server.vercel.app/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### **Expected Results:**

**✅ Success (After fix):**

```json
{
  "data": {
    "message": "If an account with this email exists, a password reset link has been sent."
  },
  "message": "Password reset email sent",
  "status": "success"
}
```

**❌ Error (Before fix):**

```json
{
  "message": "Internal server error",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

## 🔧 **Alternative Fix (Database Level)**

If the code fix doesn't work, you can also fix it at the database level by running this SQL in your Supabase dashboard:

```sql
-- This will handle the conflict at the database level
CREATE OR REPLACE FUNCTION upsert_password_reset_token(
  p_email VARCHAR(255),
  p_token VARCHAR(255),
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS void AS $$
BEGIN
  INSERT INTO password_reset_tokens (email, token, expires_at, created_at)
  VALUES (p_email, p_token, p_expires_at, NOW())
  ON CONFLICT (email) DO UPDATE SET
    token = EXCLUDED.token,
    expires_at = EXCLUDED.expires_at,
    created_at = EXCLUDED.created_at;
END;
$$ LANGUAGE plpgsql;
```

## 📊 **Monitoring the Fix**

### **Check Vercel Logs:**

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Functions" tab
4. Check the logs for any errors

### **Check Supabase Logs:**

1. Go to your Supabase dashboard
2. Go to "Logs" section
3. Check for any database errors

## 🎯 **Expected Result**

After deploying the fix:

- ✅ **No more 500 errors** on forgot-password endpoint
- ✅ **Password reset works** for both new and existing users
- ✅ **Multiple reset attempts** work without errors
- ✅ **Production stability** improved

## 🚨 **Important Notes**

1. **Database Constraints**: The unique constraint on email is intentional for security
2. **Conflict Resolution**: The `onConflict: 'email'` handles this properly
3. **User Experience**: Users can now reset passwords multiple times without errors

The fix should resolve the 500 error on your production Vercel deployment!
