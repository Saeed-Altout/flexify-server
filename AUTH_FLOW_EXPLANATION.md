# 🔐 Authentication Flow Explanation

## 🚨 **The Problem You Encountered**

You got this error when trying to resend OTP:

```json
{ "message": "User not found", "error": "Bad Request", "statusCode": 400 }
```

## 🔍 **Root Cause Analysis**

The issue was in the authentication flow design. Here's what was happening:

### **Current Authentication Flow:**

1. **Sign-up** (`POST /auth/sign-up`)
   - ✅ Sends OTP to email
   - ❌ **Does NOT create user in database**
   - User exists only as an OTP record

2. **Resend OTP** (`POST /auth/send-otp`)
   - ❌ **Looks for user in database**
   - ❌ **User doesn't exist yet** → "User not found" error

3. **Verify Account** (`POST /auth/verify-account`)
   - ✅ **This is where user gets created**
   - ✅ User is added to database with verified status

## ✅ **The Fix**

I modified the `sendOtp` method to handle both scenarios:

### **Before (❌ Broken):**

```typescript
// Check if user exists
const user = await this.supabaseService.getUserByEmail(sendOtpDto.email);
if (!user) {
  throw new BadRequestException('User not found'); // ❌ This was the problem
}
```

### **After (✅ Fixed):**

```typescript
// Check if user exists (optional)
const user = await this.supabaseService.getUserByEmail(sendOtpDto.email);

// Generate and send OTP regardless of user existence
const otp = Math.floor(10000 + Math.random() * 90000).toString();
await this.supabaseService.createOtpRecord(sendOtpDto.email, otp);

// Send email with user name if available, otherwise use default
const emailSent = await this.emailService.sendOtpEmail(
  sendOtpDto.email,
  otp,
  user?.name || 'User', // ✅ Use user name if exists, otherwise default
);
```

## 🔄 **Complete Authentication Flow**

### **For New Users (Sign-up Process):**

1. **Sign-up** → `POST /auth/sign-up`

   ```
   Input: { email, name, password }
   Output: { message: "OTP sent to your email" }
   ```

2. **Resend OTP** → `POST /auth/send-otp` ✅ **Now works!**

   ```
   Input: { email }
   Output: { message: "OTP sent to your email" }
   ```

3. **Verify Account** → `POST /auth/verify-account`
   ```
   Input: { email, otp }
   Output: { user: { id, email, name, ... } }
   ```

### **For Existing Users (Password Reset, etc.):**

1. **Resend OTP** → `POST /auth/send-otp` ✅ **Still works!**
   ```
   Input: { email }
   Output: { message: "OTP sent to your email" }
   ```

## 🧪 **Testing the Fix**

### **Test 1: New User Sign-up Flow**

```bash
# 1. Sign up
curl -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# 2. Resend OTP (this should work now!)
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 3. Verify account
curl -X POST http://localhost:3000/auth/verify-account \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"12345"}'
```

### **Test 2: Using the HTML Test Page**

Open `test-otp.html` in your browser and test the flow.

## 📝 **Key Changes Made**

1. **Removed the "User not found" check** from `sendOtp` method
2. **Made user lookup optional** - works for both new and existing users
3. **Added fallback for user name** - uses "User" if user doesn't exist yet
4. **Maintained backward compatibility** - existing users still work

## 🎯 **Result**

Now you can:

- ✅ Sign up and get OTP
- ✅ Resend OTP during signup process
- ✅ Resend OTP for existing users
- ✅ Complete the verification process

The "User not found" error should be resolved!
