# Projects API Update Documentation

## Overview

The Projects API has been updated to implement a simplified access model where:

- **Public users** can view all projects (both public and private)
- **Admins** can create, manage, and view all projects (including private ones)
- **Regular users** can view all projects (both public and private)

## Key Changes Made

### 1. Database Schema Updates

- Added `user_id` field to `projects` table to track project ownership
- Updated RLS policies to ensure only admins can manage projects
- Added foreign key constraint linking projects to users

### 2. API Response Updates

- **Added `avatarUrl`**: Creator's avatar URL from user profile
- **Added `creatorName`**: Creator's display name
- **Removed `includePrivate`**: No longer needed as main endpoint returns all projects

### 3. Endpoint Changes

#### All Projects List (GET `/projects`)

- **Before**: Could include private projects with `includePrivate=true` (admin only)
- **After**: Returns all projects (both public and private)
- **New Fields**: `avatarUrl`, `creatorName` for each project
- **Access**: Public (no authentication required)

#### Admin Projects List (GET `/projects/admin/all`)

- **New Endpoint**: Admin-only access to all projects (including private ones)
- **Authentication**: Required (JWT token with ADMIN role)
- **Response**: Same structure as public endpoint but includes private projects

#### Project Details (GET `/projects/:id`)

- **Before**: Could access private projects if admin
- **After**: Only admins can access private projects
- **New Fields**: `avatarUrl`, `creatorName`

#### Create/Update/Delete (POST/PUT/DELETE `/projects`)

- **Access**: Admin only (enforced via `ensureAdminOrThrow`)
- **Changes**: Automatically sets `user_id` to current admin's ID

## Migration Steps

### 1. Database Migration

Run the updated `supabase-setup.sql` script which includes:

```sql
-- Migration: Add user_id to existing projects table
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN user_id UUID;

        -- Set default admin user_id for existing projects
        UPDATE public.projects
        SET user_id = (
            SELECT id FROM public.user_profiles
            WHERE role = 'ADMIN'
            LIMIT 1
        )
        WHERE user_id IS NULL;

        ALTER TABLE public.projects ALTER COLUMN user_id SET NOT NULL;

        -- Add foreign key constraint
        ALTER TABLE public.projects
        ADD CONSTRAINT projects_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END$$;
```

### 2. API Usage Examples

#### Frontend - All Projects List

```typescript
// Get all projects (no auth required)
const response = await fetch('/api/projects?page=1&limit=10');
const projects = await response.json();

// Each project now includes:
// {
//   id: "...",
//   name: "...",
//   avatarUrl: "https://...", // Creator's avatar
//   creatorName: "John Doe",  // Creator's name
//   isPublic: true,
//   // ... other fields
// }
```

#### Frontend - Admin Dashboard

```typescript
// Get all projects including private ones (admin only)
const response = await fetch('/api/projects/admin/all?page=1&limit=10', {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
const allProjects = await response.json();
```

#### Frontend - Create Project (Admin Only)

```typescript
const formData = new FormData();
formData.append('name', 'My Project');
formData.append('description', 'Project description');
formData.append('isPublic', 'false'); // Private project
// ... other fields

const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
  body: formData,
});
```

## Security Considerations

### 1. Role-Based Access Control

- **Public Endpoints**: No authentication required, returns all projects
- **Admin Endpoints**: JWT token with ADMIN role required
- **Project Management**: Only admins can create/update/delete projects

### 2. Data Visibility

- Public users can view all projects (both public and private)
- Private projects are visible to all users but clearly marked
- Admin dashboard provides full management capabilities

### 3. User Ownership

- All projects are automatically associated with the creating admin
- User ID is enforced at the database level via foreign key constraints

## Benefits of This Approach

1. **Simplified Frontend Logic**: No need to handle `includePrivate` parameter
2. **Better User Experience**: All users can see all projects with creator information
3. **Improved UX**: Users see creator information (avatar, name) for each project
4. **Cleaner API**: Dedicated admin endpoint for management operations
5. **Scalable**: Easy to add more admin-specific features in the future

## Testing

### 1. Test Public Access

```bash
# Should return all projects (both public and private)
curl http://localhost:3000/api/projects
```

### 2. Test Admin Access

```bash
# Should return all projects (including private ones)
curl -H "Authorization: Bearer ADMIN_TOKEN" \
     http://localhost:3000/api/projects/admin/all
```

### 3. Test Project Creation

```bash
# Should work for admin users only
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
     -F "name=Test Project" \
     -F "description=Test Description" \
     -F "isPublic=false" \
     http://localhost:3000/api/projects
```

## Future Enhancements

1. **User Comments**: Add comment system for public users
2. **Project Likes**: Implement like functionality for public users
3. **Project Categories**: Add categorization system
4. **Advanced Filtering**: More sophisticated search and filter options
5. **Analytics**: Track project views, engagement metrics
