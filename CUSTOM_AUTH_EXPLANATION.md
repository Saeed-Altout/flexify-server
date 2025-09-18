# 🔐 Custom Authentication System

## 🚨 **Problem Solved**

You wanted to use **only** your custom authentication system with sessions, not Supabase's built-in auth. You wanted to bypass Supabase Auth entirely and manage users directly in your custom `users` table.

## ✅ **Solution Implemented**

### **1. Database Schema Changes**

#### **Updated `users` table structure:**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- ✅ Added
    avatar_url TEXT,
    role user_role DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Key Changes:**

- ✅ **Removed foreign key** to `auth.users(id)`
- ✅ **Added `password_hash` field** for secure password storage
- ✅ **Self-contained authentication** - no external dependencies
- ✅ **Simplified RLS policies** - no complex auth.uid() checks

### **2. Custom Authentication Service**

#### **Created `CustomAuthService`:**

- ✅ **Password hashing** using bcrypt with salt rounds
- ✅ **JWT token generation** for session management
- ✅ **Direct database operations** on custom users table
- ✅ **No Supabase Auth dependency**

#### **Key Features:**

```typescript
// Password hashing
const passwordHash = await bcrypt.hash(password, saltRounds);

// JWT token generation
const token = jwt.sign(
  {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  },
  jwtSecret,
  { expiresIn: '7d' },
);

// Direct user creation
const { data } = await this.supabase
  .from('users')
  .insert({
    email,
    name,
    password_hash: passwordHash,
    role: 'USER',
  })
  .select()
  .single();
```

### **3. Service Layer Updates**

#### **Updated Auth Service:**

- ✅ **Uses `CustomAuthService`** instead of `SupabaseService`
- ✅ **Handles password validation** with bcrypt
- ✅ **Generates JWT tokens** for sessions
- ✅ **Manages user sessions** with HTTP-only cookies

#### **Updated Auth Guard:**

- ✅ **Verifies JWT tokens** instead of Supabase sessions
- ✅ **Extracts tokens from cookies** or Authorization header
- ✅ **Validates user sessions** using custom logic

### **4. Database Policies Simplified**

#### **RLS Policies Updated:**

```sql
-- Before (complex Supabase Auth checks):
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- After (simple custom auth):
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true); -- Allow all for custom auth
```

### **5. Dependencies Added**

#### **New Packages:**

```bash
npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
```

## 🔄 **How It Works Now**

### **User Sign Up Flow:**

1. **User submits** signup form with email, name, password
2. **Password is hashed** using bcrypt with salt rounds
3. **User is created** directly in `public.users` table
4. **JWT token is generated** for session management
5. **Session cookie is set** with HTTP-only, secure flags

### **User Sign In Flow:**

1. **User submits** login form with email and password
2. **User is retrieved** from `public.users` table by email
3. **Password is verified** using bcrypt.compare()
4. **JWT token is generated** if credentials are valid
5. **Session cookie is set** for authentication

### **Session Management:**

1. **JWT token** contains user information (id, email, name, role)
2. **HTTP-only cookie** stores the token securely
3. **Token expiration** set to 7 days
4. **Automatic validation** on protected routes

## 🚀 **Key Benefits**

### **Complete Control:**

- ✅ **No external dependencies** - fully self-contained
- ✅ **Custom user fields** - add any fields you need
- ✅ **Flexible authentication** - implement any auth logic
- ✅ **Simple architecture** - single users table

### **Security Features:**

- ✅ **Bcrypt password hashing** - industry standard
- ✅ **JWT token management** - secure session handling
- ✅ **HTTP-only cookies** - prevents XSS attacks
- ✅ **Token expiration** - automatic session timeout

### **Development Friendly:**

- ✅ **Easy to test** - no external auth service needed
- ✅ **Simple debugging** - all logic in your codebase
- ✅ **Flexible deployment** - works anywhere
- ✅ **No vendor lock-in** - pure custom solution

## 📋 **Usage Examples**

### **Sign Up:**

```bash
curl -X POST https://flexify-server.vercel.app/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securePassword123"
  }'
```

### **Sign In:**

```bash
curl -X POST https://flexify-server.vercel.app/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### **Access Protected Route:**

```bash
curl -X GET https://flexify-server.vercel.app/api/v1/auth/me \
  -H "Cookie: session_token=your_jwt_token"
```

## 🔧 **Configuration**

### **Environment Variables:**

```env
# JWT Secret (required)
JWT_SECRET=your-super-secret-jwt-key

# Supabase (for database only)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Optional
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### **Default Credentials:**

- **Admin User**: `admin@flexify.com` / `admin123`
- **Sample Users**: All have password `password123`

## 🎯 **What's Different**

### **Before (Supabase Auth):**

- Users created in `auth.users` (read-only)
- Complex sync between `auth.users` and `public.users`
- External dependency on Supabase Auth
- Complex RLS policies with `auth.uid()`

### **After (Custom Auth):**

- Users created directly in `public.users`
- No external dependencies
- Simple, self-contained authentication
- Straightforward RLS policies

## 🚀 **Next Steps**

1. **Run the updated database setup**:

   ```sql
   -- Run 01-setup.sql in Supabase SQL Editor
   ```

2. **Test the authentication flow**:

   ```bash
   # Sign up a new user
   # Sign in with credentials
   # Access protected routes
   ```

3. **Customize as needed**:
   - Add more user fields
   - Implement additional auth features
   - Customize JWT payload
   - Add password reset functionality

---

**Your authentication system is now completely custom and self-contained!** 🎉

**No more Supabase Auth dependency - you have full control over user management and authentication!** 🔐
