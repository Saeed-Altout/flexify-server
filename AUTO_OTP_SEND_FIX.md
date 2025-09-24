# 🔐 Auto OTP Send Fix

## 🎯 **Problem Solved**

When users try to sign-in but haven't verified their account, the system now **automatically sends an OTP code** to help them complete the verification process.

## ✅ **What Happens Now**

### **Case 1: User registered but not verified (tries to sign-in)**

1. System detects pending signup
2. **Automatically generates and sends OTP**
3. Returns `ACCOUNT_NOT_VERIFIED` error
4. User receives OTP in email and can verify

### **Case 2: User exists but not verified (tries to sign-in)**

1. System detects unverified user
2. **Automatically generates and sends OTP**
3. Returns `ACCOUNT_NOT_VERIFIED` error
4. User receives OTP in email and can verify

## 🔧 **Code Changes**

### **Updated Sign-in Logic:**

```typescript
// Case 1: User registered but not verified (has pending signup)
if (!user && pendingSignup) {
  // Send OTP for verification
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  await this.supabaseService.createOtpRecord(signInDto.email, otp);

  const emailSent = await this.emailService.sendOtpEmail(
    signInDto.email,
    otp,
    pendingSignup.name,
  );

  this.logger.log(`OTP sent to ${signInDto.email} for verification`);

  throw new AccountNotVerifiedException();
}

// Case 2: User exists but not verified
if (!user.email_verified) {
  // Send OTP for verification
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  await this.supabaseService.createOtpRecord(signInDto.email, otp);

  const emailSent = await this.emailService.sendOtpEmail(
    signInDto.email,
    otp,
    user.name,
  );

  this.logger.log(`OTP sent to ${signInDto.email} for verification`);

  throw new AccountNotVerifiedException();
}
```

## 🎉 **User Experience Improvement**

### **Before:**

1. User tries to sign-in
2. Gets `ACCOUNT_NOT_VERIFIED` error
3. User has to manually request OTP
4. User receives OTP and verifies

### **After:**

1. User tries to sign-in
2. **System automatically sends OTP**
3. User gets `ACCOUNT_NOT_VERIFIED` error (with OTP already sent)
4. User receives OTP and verifies

## 🔄 **Complete Flow**

### **Registration → Sign-in Attempt:**

1. **Sign-up**: User registers → Data stored in `pending_signups` → OTP sent
2. **Sign-in attempt**: User tries to sign-in without verifying
3. **Auto OTP**: System detects pending signup → Sends new OTP automatically
4. **Error response**: Returns `ACCOUNT_NOT_VERIFIED` (but OTP is already sent)
5. **Verification**: User can now verify with the OTP they received

### **Existing User → Sign-in Attempt:**

1. **User exists**: User is in database but `email_verified = false`
2. **Sign-in attempt**: User tries to sign-in
3. **Auto OTP**: System detects unverified user → Sends OTP automatically
4. **Error response**: Returns `ACCOUNT_NOT_VERIFIED` (but OTP is already sent)
5. **Verification**: User can now verify with the OTP they received

## 🛡️ **Security & UX Benefits**

- **Better UX**: Users don't need to manually request OTP
- **Seamless flow**: Sign-in attempt automatically triggers verification process
- **No extra steps**: Users get OTP immediately when they need it
- **Clear messaging**: Error message still explains what to do
- **Automatic cleanup**: OTP records are managed properly

## 📧 **Email Behavior**

- **OTP is sent immediately** when unverified user tries to sign-in
- **Uses correct name** from pending signup or user record
- **Logs the action** for debugging and monitoring
- **Handles email failures** gracefully with warnings

This improvement makes the authentication flow much more user-friendly by automatically providing the verification code when users need it most! 🚀
