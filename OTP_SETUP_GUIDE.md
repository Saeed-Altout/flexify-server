# 🔐 OTP Setup Guide

## The Problem

The send-OTP functionality wasn't working because of **configuration property name conflicts**.

## ✅ What I Fixed

### 1. **Configuration Property Names**

The configuration file defines email properties as:

```typescript
email: {
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpSecure: process.env.SMTP_SECURE,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
}
```

But the EmailService was trying to access them as:

```typescript
// ❌ WRONG - These don't exist
email.host;
email.port;
email.secure;
email.user;
email.password;
```

**Fixed to use the correct property names:**

```typescript
// ✅ CORRECT
email.smtpHost;
email.smtpPort;
email.smtpSecure;
email.smtpUser;
email.smtpPass;
```

### 2. **Email Configuration Setup**

To make OTP work, you need to set up these environment variables:

#### **Option A: Create a `.env` file in your project root**

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

#### **Option B: Set environment variables directly**

```bash
# Windows PowerShell
$env:SMTP_USER="your_email@gmail.com"
$env:SMTP_PASS="your_app_password"
$env:SUPABASE_URL="your_supabase_url"
$env:SUPABASE_SERVICE_KEY="your_supabase_service_key"

# Windows CMD
set SMTP_USER=your_email@gmail.com
set SMTP_PASS=your_app_password
set SUPABASE_URL=your_supabase_url
set SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## 🧪 Testing the OTP Functionality

### Step 1: Open the test page

Open `test-otp.html` in your browser to test the functionality.

### Step 2: Check server logs

When you test the send-OTP endpoint, check your server console for these messages:

**✅ Success messages:**

```
[AuthService] Sending OTP to email: test@example.com
[EmailService] OTP email sent to test@example.com
[AuthService] OTP sent to test@example.com
```

**❌ Error messages to look for:**

```
[EmailService] Email configuration is missing. Email functionality will be disabled.
[AuthService] Error in sendOtp: Failed to create OTP record: ...
[AuthService] Error in sendOtp: User not found
```

## 🔧 Common Issues & Solutions

### Issue 1: "Email configuration is missing"

**Solution:** Set the SMTP_USER and SMTP_PASS environment variables.

### Issue 2: "User not found"

**Solution:** Make sure the email exists in your database. You need to register the user first.

### Issue 3: "Failed to create OTP record"

**Solution:** Check your Supabase configuration (SUPABASE_URL, SUPABASE_SERVICE_KEY).

### Issue 4: Gmail authentication issues

**Solution:**

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" (not your regular password)
3. Use the App Password in SMTP_PASS

## 📧 Gmail Setup (if using Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in your `SMTP_PASS` environment variable

3. **Gmail SMTP Settings:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

## 🚀 Quick Test

1. **Start the server:**

   ```bash
   npm run start:dev
   ```

2. **Test the endpoint:**

   ```bash
   curl -X POST http://localhost:3000/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"your_email@example.com"}'
   ```

3. **Check the response:**
   - ✅ Success: `{"data":{"message":"OTP sent to your email"},"message":"OTP sent successfully","status":"success"}`
   - ❌ Error: Check the error message and server logs

## 📝 Next Steps

1. Set up your environment variables
2. Test with the provided HTML file
3. Check server logs for any remaining issues
4. Verify emails are being sent to your inbox

The configuration conflict has been resolved, so OTP should work once you set up the environment variables!
