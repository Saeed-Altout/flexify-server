# 🚀 Database Setup Steps

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `flexify-server`
5. Set database password
6. Choose region
7. Click "Create new project"

## Step 2: Get Supabase Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (public key)
   - **Service Role Key** (secret key)

## Step 3: Set Up Environment Variables

Create `.env` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Step 4: Run Database Setup

1. Go to Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire content of `01-setup.sql`
5. Click "Run" button
6. Wait for completion message

## Step 5: Add Sample Data (Optional)

1. In SQL Editor, click "New query"
2. Copy and paste the entire content of `02-sample-data.sql`
3. Click "Run" button
4. Wait for completion message

## Step 6: Verify Setup

1. Go to "Table Editor" in Supabase Dashboard
2. Check that these tables exist:
   - `users` (with admin user)
   - `technologies` (8 sample technologies)
   - `projects` (empty or with sample data)
   - `messages` (empty or with sample data)
   - `message_replies` (empty or with sample data)

## Step 7: Test Your Server

1. Open terminal in your project directory
2. Run: `npm run start:dev`
3. Check that server starts without errors
4. Test API endpoints:
   - `GET http://localhost:3000/api/technologies`
   - `POST http://localhost:3000/api/auth/signup`
   - `POST http://localhost:3000/api/auth/signin`

## Step 8: Reset Database (If Needed)

If you need to start over:

1. Go to SQL Editor
2. Copy and paste `03-cleanup.sql`
3. Click "Run" button
4. Go back to Step 4

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] `01-setup.sql` executed successfully
- [ ] `02-sample-data.sql` executed (optional)
- [ ] All tables visible in Table Editor
- [ ] Server starts without errors
- [ ] API endpoints responding

## 🆘 Troubleshooting

### "relation does not exist" error

- Make sure you ran `01-setup.sql` first
- Check that all tables exist in Table Editor

### "permission denied" error

- Verify your environment variables are correct
- Check that RLS policies are enabled

### Server won't start

- Check your `.env` file has all required variables
- Verify Supabase credentials are correct
- Check server logs for specific errors

### API endpoints not working

- Ensure database setup completed successfully
- Check that sample data was inserted (if using)
- Verify authentication is working

---

**Need help?** Check the main `README.md` file for detailed troubleshooting!
