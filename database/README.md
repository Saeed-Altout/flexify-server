# Flexify Server Database Setup

This directory contains SQL scripts to set up the complete database schema for the Flexify Server application.

## Files

- `setup.sql` - Complete database setup script
- `cleanup.sql` - Database cleanup script (removes all data)
- `README.md` - This documentation file

## Quick Start

### 1. Setup Database

Run the `setup.sql` script in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `setup.sql`
4. Click "Run" to execute the script

### 2. Verify Setup

After running the setup script, you should see:

- 6 tables created (users, sessions, technologies, projects, messages, message_replies)
- 3 enums created (user_role, project_status, message_status)
- Sample data inserted
- Row Level Security enabled
- All necessary indexes and triggers created

## Database Schema

### Tables

#### Users

- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `name` (VARCHAR)
- `password_hash` (VARCHAR)
- `avatar_url` (TEXT)
- `role` (user_role enum: USER, ADMIN)
- `is_active` (BOOLEAN)
- `email_verified` (BOOLEAN)
- `last_login_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Sessions

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `token_hash` (VARCHAR, Unique)
- `expires_at` (TIMESTAMP)
- `is_active` (BOOLEAN)
- `ip_address` (VARCHAR)
- `user_agent` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Technologies

- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `description` (TEXT)
- `category` (VARCHAR)
- `icon_url` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Projects

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `title` (VARCHAR)
- `description` (TEXT)
- `content` (TEXT)
- `status` (project_status enum: planning, active, in_progress, completed)
- `technologies` (UUID array)
- `images` (TEXT array)
- `demo_url` (TEXT)
- `github_url` (TEXT)
- `is_public` (BOOLEAN)
- `is_featured` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Messages

- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `subject` (VARCHAR)
- `message` (TEXT)
- `status` (message_status enum: unread, read, replied, archived)
- `ip_address` (VARCHAR)
- `user_agent` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Message Replies

- `id` (UUID, Primary Key)
- `message_id` (UUID, Foreign Key to messages)
- `user_id` (UUID, Foreign Key to users)
- `reply` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Enums

- `user_role`: USER, ADMIN
- `project_status`: planning, active, in_progress, completed
- `message_status`: unread, read, replied, archived

### Functions

- `update_updated_at_column()` - Automatically updates the updated_at timestamp
- `clean_expired_sessions()` - Removes expired sessions
- `get_user_stats(user_uuid)` - Returns user statistics

### Views

- `project_stats` - Project statistics view
- `message_stats` - Message statistics view

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Users**: Can view/update their own profile
- **Sessions**: Users can manage their own sessions
- **Technologies**: Public read, admin write
- **Projects**: Public read for public projects, users can manage their own
- **Messages**: Public read, admin write
- **Message Replies**: Public read, admin write

## Sample Data

The setup script includes sample data:

- 15 technologies (React, Vue.js, Angular, Node.js, etc.)
- 2 users (admin and regular user)
- 4 sample projects
- 4 sample messages
- 1 sample message reply

## Environment Variables

Make sure to set these environment variables in your application:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure you're using the service key, not the anon key
2. **RLS Policies**: If you get permission errors, check that RLS policies are correctly set
3. **Foreign Key Errors**: Make sure to run the setup script in the correct order

### Reset Database

If you need to start over:

1. Run `cleanup.sql` to remove everything
2. Run `setup.sql` to recreate the schema

## API Endpoints

After setup, your API will be available at:

- Health Check: `GET /api/v1/health`
- Swagger Docs: `GET /api/docs`
- Auth: `POST /api/v1/auth/sign-up`, `POST /api/v1/auth/sign-in`, etc.
- Technologies: `GET /api/v1/technologies`, `POST /api/v1/technologies`, etc.
- Projects: `GET /api/v1/projects`, `POST /api/v1/projects`, etc.
- Messages: `GET /api/v1/messages`, `POST /api/v1/messages`, etc.

## Support

If you encounter any issues:

1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Ensure all tables and policies were created correctly
4. Check the application logs for specific error messages
