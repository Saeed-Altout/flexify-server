# 🔧 Fix Database Foreign Key Error

## 🚨 **Error Explanation**

The error `insert or update on table "users" violates foreign key constraint "users_id_fkey"` occurs because:

1. **Old database schema** still has a foreign key constraint to `auth.users`
2. **Custom authentication** doesn't use `auth.users` - it uses `public.users` directly
3. **Foreign key constraint** prevents inserting users with custom IDs

## ✅ **Solution Steps**

### **Step 1: Run Complete Cleanup**

```sql
-- Copy and paste this into Supabase SQL Editor
-- This removes all old tables and constraints

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS message_replies CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
```

### **Step 2: Run Fresh Setup**

```sql
-- Copy and paste 01-setup.sql content into Supabase SQL Editor
-- This creates the new custom authentication schema
```

### **Step 3: Add Sample Data**

```sql
-- Copy and paste 02-sample-data.sql content into Supabase SQL Editor
-- This adds sample users and data for testing
```

## 🎯 **Alternative: Quick Fix (If You Want to Keep Existing Data)**

If you have important data you want to keep, run this instead:

```sql
-- Drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Insert admin user
INSERT INTO users (id, email, name, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@flexify.com', 'Admin User', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
```

## 🚀 **After Fixing**

Once you've run the cleanup and setup scripts:

1. **Test the authentication**:

   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/sign-in \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@flexify.com","password":"admin123"}'
   ```

2. **Check Swagger docs**: `http://localhost:3000/api/docs`

3. **Verify database**: Check that `users` table has `password_hash` column

## 🔍 **Why This Happened**

- **Old schema**: Had foreign key `users.id` → `auth.users.id`
- **New schema**: `users.id` is independent (custom authentication)
- **Conflict**: Can't insert custom IDs when foreign key expects them in `auth.users`

## ✅ **Expected Result**

After fixing, you should have:

- ✅ **Custom authentication** working
- ✅ **No foreign key constraints** to `auth.users`
- ✅ **Admin user** created successfully
- ✅ **All endpoints** working properly

---

**Run the cleanup script first, then the setup script, and your custom authentication will work perfectly!** 🎉
