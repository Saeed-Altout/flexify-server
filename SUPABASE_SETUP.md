# 🗄️ Supabase Setup Guide

This guide will help you set up Supabase for the Flexify Auth Service, including table creation and proper configuration.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Project Created**: Create a new Supabase project
3. **Project URL and Keys**: Get your project URL and API keys

## 🏗️ Step 1: Project Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `flexify-auth-service` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

## 🗂️ Step 2: Database Schema Setup

### 2.1 Enable Row Level Security (RLS)

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Enable RLS on the `auth.users` table (should be enabled by default)

### 2.2 Create Custom User Profile Table

Run the following SQL in the **SQL Editor**:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS on_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER on_user_profiles_updated
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 2.3 Create Additional Tables (Optional)

If you need additional functionality, create these tables:

```sql
-- Create sessions table for tracking user sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
    FOR DELETE USING (auth.uid() = user_id);
```

## ⚙️ Step 3: Authentication Configuration

### 3.1 Configure Authentication Settings

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure the following settings:

#### Email Settings

- **Enable email confirmations**: `ON` (for production) or `OFF` (for development)
- **Enable email change confirmations**: `ON`
- **Enable secure email change**: `ON`

#### Password Settings

- **Minimum password length**: `6`
- **Enable password strength requirements**: `OFF` (for development) or `ON` (for production)

#### Session Settings

- **JWT expiry**: `3600` (1 hour) or `604800` (7 days)
- **Refresh token rotation**: `ON`
- **Refresh token reuse interval**: `10`

### 3.2 Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**
   - **Reset password**
   - **Change email address**
   - **Magic link**

Example email template customization:

```html
<!-- Confirm signup template -->
<h2>Welcome to Flexify Auth Service!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

## 🔐 Step 4: API Configuration

### 4.1 Configure CORS (if needed)

1. Go to **Settings** → **API**
2. Under **CORS (Cross-Origin Resource Sharing)**, add your frontend URLs:
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `http://localhost:3001`
   - `http://localhost:8080`
   - Your production domain

### 4.2 Configure Auth Policies

Run these additional SQL commands for better security:

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role');
```

## 🚀 Step 5: Environment Configuration

### 5.1 Update Your .env File

Create or update your `.env` file with the correct Supabase credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration (for production, set specific origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3001,http://localhost:8080
```

### 5.2 Verify Configuration

1. **Test the connection** by running your application:

   ```bash
   npm run start:dev
   ```

2. **Check the logs** for any connection errors

3. **Test registration** using the Swagger UI at `http://localhost:3000/api/docs`

## 🔍 Step 6: Troubleshooting

### Common Issues and Solutions

#### 1. "User not allowed" Error

**Cause**: Incorrect service role key or missing permissions

**Solution**:

1. Verify you're using the **service_role** key, not the **anon** key
2. Check that RLS policies are correctly configured
3. Ensure the service role has proper permissions

#### 2. "Invalid API key" Error

**Cause**: Incorrect API key or project URL

**Solution**:

1. Double-check your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
2. Ensure there are no extra spaces or characters
3. Verify the project is active in your Supabase dashboard

#### 3. "Table does not exist" Error

**Cause**: Tables not created or wrong schema

**Solution**:

1. Run the SQL commands from Step 2
2. Check that tables exist in the `public` schema
3. Verify table names match your code

#### 4. CORS Errors

**Cause**: CORS not configured properly

**Solution**:

1. Add your frontend URLs to CORS settings in Supabase
2. Check your application's CORS configuration
3. Ensure credentials are included in requests

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Database Monitoring

1. **Go to Dashboard** → **Database** → **Tables**
2. Monitor table sizes and performance
3. Check for any failed queries or errors

### 7.2 Authentication Monitoring

1. **Go to Authentication** → **Users**
2. Monitor user registrations and logins
3. Check for any authentication errors

### 7.3 API Monitoring

1. **Go to Settings** → **API**
2. Monitor API usage and rate limits
3. Check for any API errors or issues

## 🎯 Step 8: Production Checklist

Before deploying to production:

- [ ] **Environment Variables**: All production values set
- [ ] **CORS Configuration**: Production domains added
- [ ] **Email Templates**: Customized for your brand
- [ ] **Security Policies**: RLS enabled and configured
- [ ] **Monitoring**: Set up logging and monitoring
- [ ] **Backup**: Database backup strategy in place
- [ ] **SSL**: HTTPS enabled for all endpoints
- [ ] **Rate Limiting**: Configured if needed

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Supabase API Reference](https://supabase.com/docs/reference)

## 🆘 Support

If you encounter issues:

1. **Check Supabase Status**: [status.supabase.com](https://status.supabase.com)
2. **Supabase Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)

---

**🎉 Congratulations!** Your Supabase setup is now complete and ready for the Flexify Auth Service.
