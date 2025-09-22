# Projects Image API Documentation

## Overview

The Projects module now includes comprehensive image handling capabilities with best practices for creating projects with images. This documentation covers all the improvements and new features.

## Database Schema Updates

### New Migration: `14-fix-projects-schema.sql`

The database schema has been updated to include:

- **`cover`** field: URL of the project cover image
- **`likes_count`** field: Total number of likes for the project (replaces the old `likes` field)
- **Proper indexing** for better performance
- **Field documentation** with comments

## API Endpoints

### 1. Create Project

```
POST /projects
```

**Request Body:**

```json
{
  "title": "My Awesome Project",
  "description": "Project description",
  "content": "Detailed project content",
  "status": "planning",
  "technologies": ["uuid1", "uuid2"],
  "cover": "https://example.com/cover.jpg",
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "demo_url": "https://demo.example.com",
  "github_url": "https://github.com/user/repo",
  "is_public": true,
  "is_featured": false
}
```

### 2. Upload Project Cover Image

```
POST /projects/:id/cover
Content-Type: multipart/form-data
```

**Request:**

- `file`: Image file (max 10MB)
- Supported formats: JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC

**Response:**

```json
{
  "data": {
    "url": "https://storage.example.com/project-images/user-123/project-456/cover.jpg",
    "path": "user-123/project-456/cover.jpg",
    "filename": "1703123456789-abc123.jpg"
  },
  "message": "Project cover uploaded successfully",
  "status": "success"
}
```

### 3. Upload Project Image

```
POST /projects/:id/images
Content-Type: multipart/form-data
```

**Request:**

- `file`: Image file (max 10MB)
- Maximum 10 images per project

**Response:**

```json
{
  "data": {
    "url": "https://storage.example.com/project-images/user-123/project-456/image1.jpg",
    "path": "user-123/project-456/image1.jpg",
    "filename": "1703123456789-def456.jpg"
  },
  "message": "Project image uploaded successfully",
  "status": "success"
}
```

### 4. Delete Project Image

```
DELETE /projects/:id/images
```

**Request Body:**

```json
{
  "project_id": "uuid",
  "image_url": "https://storage.example.com/project-images/user-123/project-456/image1.jpg"
}
```

**Response:**

```json
{
  "data": null,
  "message": "Project image deleted successfully",
  "status": "success"
}
```

## DTO Improvements

### Enhanced Validation

The DTOs now include comprehensive validation:

```typescript
// CreateProjectDto & UpdateProjectDto
{
  cover?: string; // @IsUrl() validation
  images?: string[]; // @IsUrl({}, { each: true }) @ArrayMaxSize(10)
  // ... other fields
}
```

### New DTOs

```typescript
export class UploadProjectImageDto {
  @IsUUID('4')
  @IsNotEmpty()
  project_id: string;
}

export class DeleteProjectImageDto {
  @IsUUID('4')
  @IsNotEmpty()
  project_id: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image_url: string;
}
```

## Best Practices Implemented

### 1. Image Validation

- **File type validation**: Only allowed image formats
- **File size limits**: 10MB for project images, 5MB for profile images
- **Buffer validation**: Ensures file buffer is not empty
- **Unique filenames**: Timestamp + random string to prevent conflicts

### 2. Security

- **Authentication required**: All image operations require valid JWT
- **Ownership validation**: Users can only modify their own projects
- **File overwrite prevention**: `upsert: false` prevents accidental overwrites

### 3. Performance

- **Database indexing**: Added indexes for better query performance
- **Image limits**: Maximum 10 images per project
- **Proper error handling**: Comprehensive error messages and status codes

### 4. File Organization

- **Structured paths**: `user-{userId}/project-{projectId}/filename`
- **Proper metadata**: Content type and cache control headers
- **Public URLs**: Automatic generation of public URLs

## Error Handling

### Common Error Responses

```json
// File too large
{
  "statusCode": 400,
  "message": "File too large. Max size: 10MB",
  "error": "Bad Request"
}

// Invalid file type
{
  "statusCode": 400,
  "message": "Invalid file type. Allowed: image/jpeg, image/png, ...",
  "error": "Bad Request"
}

// Maximum images reached
{
  "statusCode": 400,
  "message": "Maximum number of images (10) reached for this project",
  "error": "Bad Request"
}

// Project not found
{
  "statusCode": 404,
  "message": "Project with ID {id} not found",
  "error": "Not Found"
}

// Unauthorized access
{
  "statusCode": 403,
  "message": "You can only update your own projects",
  "error": "Forbidden"
}
```

## Usage Examples

### 1. Create Project with Images

```javascript
// 1. Create project
const project = await fetch('/projects', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'My Project',
    description: 'A great project',
    status: 'planning',
    is_public: true,
  }),
});

// 2. Upload cover image
const formData = new FormData();
formData.append('file', coverImageFile);

const coverResponse = await fetch(`/projects/${projectId}/cover`, {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
  },
  body: formData,
});

// 3. Upload additional images
const imagePromises = imageFiles.map((file) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(`/projects/${projectId}/images`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <token>',
    },
    body: formData,
  });
});

await Promise.all(imagePromises);
```

### 2. Update Project Images

```javascript
// Delete an image
await fetch(`/projects/${projectId}/images`, {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    project_id: projectId,
    image_url: 'https://storage.example.com/old-image.jpg',
  }),
});

// Upload new image
const formData = new FormData();
formData.append('file', newImageFile);

await fetch(`/projects/${projectId}/images`, {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
  },
  body: formData,
});
```

## Migration Instructions

### 1. Run Database Migration

Execute the `14-fix-projects-schema.sql` script in your Supabase SQL editor:

```sql
-- This will add the missing fields and fix the schema
-- Run the contents of database/14-fix-projects-schema.sql
```

### 2. Update Environment Variables

Ensure your environment has the required Supabase configuration:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Test the Implementation

1. Create a new project
2. Upload a cover image
3. Upload multiple project images
4. Delete an image
5. Verify all operations work correctly

## Summary

The Projects module now provides:

✅ **Complete image handling** with cover and multiple images  
✅ **Proper validation** and error handling  
✅ **Security** with authentication and authorization  
✅ **Performance** with indexing and limits  
✅ **Best practices** for file uploads and storage  
✅ **Comprehensive API** with all CRUD operations

The implementation follows NestJS best practices and provides a robust foundation for project management with images.
