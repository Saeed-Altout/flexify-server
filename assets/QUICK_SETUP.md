# 🚀 Quick Supabase Setup Checklist

## ⚡ Immediate Steps to Fix "User not allowed" Error

### 1. 🔑 Get Correct API Keys

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **service_role key**: (starts with `eyJ...` - **NOT the anon key**)

### 2. 📝 Update Environment Variables

Update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
```

**⚠️ Important**: Use the **service_role** key, not the **anon** key!

### 3. 🗄️ Create Database Tables

Run this SQL in your Supabase **SQL Editor**:

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

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles
CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
    FOR ALL USING (auth.role() = 'service_role');
```

### 4. 🔄 Restart Your Application

```bash
npm run start:dev
```

### 5. ✅ Test the Setup

1. Go to `http://localhost:3000/api/docs`
2. Try the registration endpoint
3. Check the logs for any errors

## 🎯 Common Issues & Solutions

### ❌ "User not allowed" Error

**Solution**: You're using the wrong API key
- ✅ Use **service_role** key (not anon key)
- ✅ Check for extra spaces in your .env file
- ✅ Verify the project URL is correct

### ❌ "Invalid API key" Error

**Solution**: Check your credentials
- ✅ Copy the exact key from Supabase dashboard
- ✅ No extra characters or spaces
- ✅ Project URL matches your project

### ❌ "Table does not exist" Error

**Solution**: Run the SQL script
- ✅ Execute the SQL commands above
- ✅ Check that tables exist in `public` schema
- ✅ Verify table names match

## 📞 Need Help?

1. **Check the full guide**: `SUPABASE_SETUP.md`
2. **Run the SQL script**: `supabase-setup.sql`
3. **Verify your setup**: Check the troubleshooting section

## 🎉 Success Indicators

- ✅ Application starts without errors
- ✅ Registration endpoint works
- ✅ User is created in Supabase dashboard
- ✅ No "User not allowed" errors in logs

---

**🚀 You're ready to go!** Your Supabase setup should now work correctly.
