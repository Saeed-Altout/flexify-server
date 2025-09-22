# Project Likes/Dislikes API Documentation

## Overview

This document describes the project likes/dislikes functionality that allows authenticated users to like or dislike projects. The system ensures that each user can only have one like or dislike per project, and users must be authenticated (registered by email) to perform these actions.

## Database Schema

### Project Likes Table

```sql
CREATE TABLE project_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL, -- true for like, false for dislike
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Ensure one like/dislike per user per project
    UNIQUE(project_id, user_id)
);
```

### Key Features

- **Unique Constraint**: Each user can only have one like or dislike per project
- **Cascade Delete**: When a project or user is deleted, their likes are automatically removed
- **Automatic Count Updates**: The `projects.likes` field is automatically updated via database triggers
- **Row Level Security**: Proper RLS policies ensure data security

## API Endpoints

### 1. Like a Project

**Endpoint:** `POST /projects/like`

**Authentication:** Required (JWT token)

**Request Body:**

```json
{
  "project_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**

```json
{
  "data": {
    "id": "like-id-here",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-id-here",
    "is_like": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Project liked successfully",
  "status": "success"
}
```

**Status Codes:**

- `201` - Project liked successfully
- `400` - Invalid input data or project not found
- `401` - Unauthorized (authentication required)

### 2. Dislike a Project

**Endpoint:** `POST /projects/dislike`

**Authentication:** Required (JWT token)

**Request Body:**

```json
{
  "project_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response:**

```json
{
  "data": {
    "id": "like-id-here",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-id-here",
    "is_like": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Project disliked successfully",
  "status": "success"
}
```

**Status Codes:**

- `201` - Project disliked successfully
- `400` - Invalid input data or project not found
- `401` - Unauthorized (authentication required)

### 3. Toggle Project Like

**Endpoint:** `POST /projects/toggle-like`

**Authentication:** Required (JWT token)

**Request Body:**

```json
{
  "project_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response (When Adding Like):**

```json
{
  "data": {
    "id": "like-id-here",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-id-here",
    "is_like": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Project liked successfully",
  "status": "success"
}
```

**Response (When Removing Like):**

```json
{
  "data": null,
  "message": "Like/dislike removed successfully",
  "status": "success"
}
```

**Status Codes:**

- `201` - Project like toggled successfully
- `400` - Invalid input data or project not found
- `401` - Unauthorized (authentication required)

**Toggle Behavior:**

- **If user has NOT liked the project** → Creates a new like
- **If user has already liked the project** → Removes the like
- **Simple binary toggle**: Like ↔ No Like

### 4. Remove Like/Dislike

**Endpoint:** `DELETE /projects/:id/like`

**Authentication:** Required (JWT token)

**Response:**

```json
{
  "data": null,
  "message": "Like/dislike removed successfully",
  "status": "success"
}
```

**Status Codes:**

- `200` - Like/dislike removed successfully
- `401` - Unauthorized (authentication required)
- `404` - No like or dislike found for this project

### 5. Get Project Likes Statistics

**Endpoint:** `GET /projects/:id/likes`

**Authentication:** Optional (if authenticated, shows user's like/dislike status)

**Response:**

```json
{
  "data": {
    "likes_count": 42,
    "dislikes_count": 5,
    "user_liked": true,
    "user_disliked": false
  },
  "message": "Project likes stats retrieved successfully",
  "status": "success"
}
```

**Status Codes:**

- `200` - Statistics retrieved successfully
- `404` - Project not found

## Behavior Details

### Like/Dislike Logic

1. **First Time**: If a user hasn't liked or disliked a project before, a new record is created
2. **Existing Like**: If a user already liked a project and tries to like again, the action is ignored (no change)
3. **Existing Dislike**: If a user previously disliked a project and now likes it, the record is updated to `is_like: true`
4. **Existing Like → Dislike**: If a user previously liked a project and now dislikes it, the record is updated to `is_like: false`
5. **Remove**: Users can remove their like/dislike entirely, which deletes the record

### Authentication Requirements

- All like/dislike operations require authentication
- Users must be registered (have an account with email)
- JWT token must be valid and not expired
- The `CurrentUser` decorator extracts the user ID from the JWT token

### Database Triggers

The system includes automatic triggers that update the `projects.likes` count whenever likes are added, updated, or removed:

```sql
-- Trigger function to update likes count
CREATE OR REPLACE FUNCTION update_project_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects
    SET likes = (
        SELECT COUNT(*)
        FROM project_likes
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        AND is_like = true
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Error Handling

### Common Error Scenarios

1. **Project Not Found**: Returns 400 with message "Project with ID {id} not found"
2. **Invalid Project ID**: Returns 400 with validation error
3. **Unauthorized**: Returns 401 when JWT token is missing or invalid
4. **No Like Found**: Returns 404 when trying to remove a non-existent like/dislike

### Validation

- Project ID must be a valid UUID
- User must be authenticated
- Project must exist in the database

## Usage Examples

### Frontend Integration

```javascript
// Like a project
const likeProject = async (projectId) => {
  const response = await fetch('/api/projects/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ project_id: projectId }),
  });
  return response.json();
};

// Toggle like (recommended approach)
const toggleProjectLike = async (projectId) => {
  const response = await fetch('/api/projects/toggle-like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
    }),
  });
  return response.json();
};

// Get likes statistics
const getLikesStats = async (projectId) => {
  const response = await fetch(`/api/projects/${projectId}/likes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

### cURL Examples

```bash
# Like a project
curl -X POST http://localhost:3000/projects/like \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"project_id": "123e4567-e89b-12d3-a456-426614174000"}'

# Toggle like (recommended)
curl -X POST http://localhost:3000/projects/toggle-like \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"project_id": "123e4567-e89b-12d3-a456-426614174000"}'

# Get likes statistics
curl -X GET http://localhost:3000/projects/123e4567-e89b-12d3-a456-426614174000/likes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Remove like/dislike
curl -X DELETE http://localhost:3000/projects/123e4567-e89b-12d3-a456-426614174000/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Migration

To set up the likes system, run the migration script:

```bash
# Run the migration
psql -d your_database -f database/13-add-project-likes.sql
```

This will:

1. Create the `project_likes` table
2. Set up proper indexes for performance
3. Create RLS policies for security
4. Add triggers for automatic count updates
5. Update existing projects with correct likes counts

## Security Considerations

1. **Authentication Required**: All like/dislike operations require valid authentication
2. **User Isolation**: Users can only manage their own likes/dislikes
3. **RLS Policies**: Database-level security ensures data integrity
4. **Input Validation**: All inputs are validated using DTOs and class-validator
5. **Cascade Deletes**: Proper cleanup when users or projects are deleted

## Performance Considerations

1. **Indexes**: Proper indexes on `project_id`, `user_id`, and `is_like` for fast queries
2. **Triggers**: Automatic count updates without additional API calls
3. **Efficient Queries**: Optimized database queries for statistics
4. **Caching**: Consider caching likes counts for high-traffic projects

## Future Enhancements

Potential future improvements could include:

1. **Like Notifications**: Notify project owners when their projects are liked
2. **Like History**: Track when likes were given/removed
3. **Bulk Operations**: Like/dislike multiple projects at once
4. **Analytics**: Detailed analytics on project engagement
5. **Rate Limiting**: Prevent spam liking/disliking
