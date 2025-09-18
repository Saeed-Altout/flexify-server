# 🗄️ Flexify Server Database

Complete database setup for the Flexify Server project.

## 📁 Files

| File                       | Description                            | When to Use                          |
| -------------------------- | -------------------------------------- | ------------------------------------ |
| `01-setup.sql`             | Complete database setup                | First time setup                     |
| `02-sample-data.sql`       | Sample data for testing (idempotent)   | After setup, for development         |
| `03-cleanup.sql`           | Remove all data and tables             | When you need to reset everything    |
| `05-migrate-auth-sync.sql` | Migrate existing database to auth sync | If you have existing data to migrate |

## 🚀 Quick Start

### 1. Initial Setup

```sql
-- Run in Supabase SQL Editor
-- Copy and paste 01-setup.sql content
```

### 2. Add Sample Data (Optional)

```sql
-- Run in Supabase SQL Editor
-- Copy and paste 02-sample-data.sql content
```

### 3. Reset Database (If Needed)

```sql
-- Run in Supabase SQL Editor
-- Copy and paste 03-cleanup.sql content
-- Then run 01-setup.sql again
```

## 🔐 Authentication System

The database uses a **custom authentication system** that manages users directly in the `users` table:

### **How It Works:**

1. **Custom Users Table (`public.users`)**:
   - Stores all user data including authentication
   - Contains: `id`, `email`, `name`, `password_hash`, `avatar_url`, `role`, `created_at`, `updated_at`
   - **Self-contained** - no external dependencies

2. **Password Security**:
   - Passwords are hashed using bcrypt with salt rounds
   - Secure password storage and verification
   - No plain text passwords in database

3. **JWT Token Management**:
   - JWT tokens generated for session management
   - 7-day token expiration
   - HTTP-only cookies for secure token storage

### **Key Benefits:**

- ✅ **Complete control** - no external auth dependencies
- ✅ **Secure authentication** - bcrypt password hashing
- ✅ **Session management** - JWT tokens with HTTP-only cookies
- ✅ **Custom fields** - extend user profiles as needed
- ✅ **Simple architecture** - single users table for everything

## 🏗️ Database Schema

### Tables

#### `users`

- **Purpose**: User accounts and authentication (custom auth system)
- **Key Fields**: `id`, `email`, `name`, `password_hash`, `avatar_url`, `role`
- **Authentication**: Self-contained with bcrypt password hashing
- **Sessions**: JWT tokens with HTTP-only cookies

#### `technologies`

- **Purpose**: Technology stack management
- **Key Fields**: `id`, `name`, `description`, `category`
- **Sample Data**: React, Node.js, PostgreSQL, etc.

#### `projects`

- **Purpose**: User projects and portfolios
- **Key Fields**: `id`, `title`, `description`, `status`, `user_id`
- **Status Options**: `active`, `in_progress`, `completed`, `planning`

#### `messages`

- **Purpose**: Contact form submissions
- **Key Fields**: `id`, `name`, `email`, `subject`, `message`, `status`
- **Status Options**: `unread`, `read`, `replied`

#### `message_replies`

- **Purpose**: Admin replies to messages
- **Key Fields**: `id`, `message_id`, `user_id`, `reply`

### Enums

- **`user_role`**: `USER`, `ADMIN`
- **`project_status`**: `active`, `in_progress`, `completed`, `planning`
- **`message_status`**: `unread`, `read`, `replied`

## 🔐 Security Features

### Row Level Security (RLS)

- **Users**: Can only view/update their own data
- **Admins**: Can view/update all data
- **Technologies**: Public read, admin write
- **Messages**: Users see their own, admins see all
- **Projects**: Users manage their own, admins see all

### Authentication

- Uses Supabase Auth (`auth.uid()`)
- JWT token validation
- Role-based access control

## 📊 Sample Data

After running `02-sample-data.sql`, you'll have:

- **6 users** (1 admin + 5 regular users)
- **10 projects** (various statuses)
- **10 messages** (contact form submissions)
- **4 message replies** (admin responses)
- **8 technologies** (common tech stack)

## 🔧 Environment Setup

### Required Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Supabase Configuration

1. Create a new Supabase project
2. Go to SQL Editor
3. Run `01-setup.sql`
4. Optionally run `02-sample-data.sql`
5. Configure your environment variables

## 🚨 Troubleshooting

### Common Issues

#### "relation does not exist" error

- **Solution**: Make sure you ran `01-setup.sql` first
- **Check**: Verify all tables exist in Supabase dashboard

#### "permission denied" error

- **Solution**: Check your RLS policies
- **Check**: Verify user authentication is working

#### "foreign key constraint" error

- **Solution**: Run `03-cleanup.sql` then `01-setup.sql`
- **Check**: Ensure proper table creation order

### Reset Everything

```sql
-- 1. Run 03-cleanup.sql
-- 2. Run 01-setup.sql
-- 3. Optionally run 02-sample-data.sql
```

## 📈 Performance

### Indexes

- **Users**: `email`, `role`
- **Projects**: `user_id`, `status`, `created_at`
- **Messages**: `user_id`, `status`, `created_at`
- **Message Replies**: `message_id`, `user_id`

### Optimization

- All tables have `created_at` and `updated_at` timestamps
- Automatic `updated_at` triggers on all tables
- Proper foreign key relationships
- Efficient indexing strategy

## 🔄 Maintenance

### Regular Tasks

- Monitor database performance
- Update RLS policies as needed
- Backup important data
- Review and optimize queries

### Updates

- Add new tables in `01-setup.sql`
- Update sample data in `02-sample-data.sql`
- Test changes with `03-cleanup.sql` + `01-setup.sql`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Messages

- `GET /api/messages` - List messages (admin)
- `POST /api/messages` - Create message
- `GET /api/messages/:id` - Get message details
- `PUT /api/messages/:id` - Update message
- `POST /api/messages/:id/replies` - Reply to message

### Technologies

- `GET /api/technologies` - List technologies
- `POST /api/technologies` - Create technology (admin)
- `PUT /api/technologies/:id` - Update technology (admin)
- `DELETE /api/technologies/:id` - Delete technology (admin)

## 🎯 Next Steps

1. **Run Setup**: Execute `01-setup.sql` in Supabase
2. **Add Sample Data**: Run `02-sample-data.sql` for testing
3. **Configure Environment**: Set up your `.env` file
4. **Start Server**: Run `npm run start:dev`
5. **Test APIs**: Use the provided endpoints

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your Supabase configuration
3. Ensure all environment variables are set
4. Check the server logs for detailed error messages

---

**Happy coding! 🚀**
