# 📸 Image Microservice Migration Documentation

## Overview

This document explains the migration from complex file upload systems in projects and technologies to a dedicated image microservice. The new architecture separates image management from business logic, making the system more maintainable and flexible.

## 🔄 What Changed

### Before (Complex File Upload System)

- **Projects**: Had complex cover upload with file handling
- **Technologies**: Had complex icon upload with file handling
- **Tight Coupling**: File upload logic mixed with business logic
- **Complex DTOs**: Multiple file upload endpoints and validation
- **Hard to Test**: Complex file upload scenarios

### After (Dedicated Image Microservice)

- **Separate Service**: Independent image management microservice
- **Simple URLs**: Projects and technologies use simple URL strings
- **Loose Coupling**: Image management separated from business logic
- **Easy Testing**: Simple URL assignment scenarios
- **Flexible Workflow**: Upload images first, assign later

## 🏗️ New Architecture

### Image Microservice (`/images`)

A dedicated service for handling all image operations:

```
src/images/
├── images.controller.ts      # REST API endpoints
├── images.service.ts         # Business logic
├── images.module.ts          # Module configuration
├── dto/
│   └── images.dto.ts         # Data Transfer Objects
├── types/
│   └── images.types.ts       # TypeScript interfaces
└── README.md                 # Documentation
```

### Simplified Projects Module

Projects now use simple `cover_url` string field:

```typescript
interface Project {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status: ProjectStatus;
  user_id: string;
  technologies: string[];
  likes_count: number;
  cover_url?: string; // Simple URL string
  demo_url?: string;
  github_url?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}
```

### Simplified Technologies Module

Technologies now use simple `icon_url` string field:

```typescript
interface Technology {
  id: string;
  name: string;
  description?: string;
  category: TechnologyCategory;
  icon_url?: string; // Simple URL string
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## 🔧 API Endpoints

### Image Microservice Endpoints

#### 1. Upload Image

**Endpoint:** `POST /images/upload`

**Headers:**

```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body:**

```
file: <binary-data>
```

**Response:**

```json
{
  "data": {
    "id": "img-uuid-123",
    "url": "https://storage.example.com/path/to/image.jpg",
    "filename": "image.jpg",
    "path": "user-123/image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploaded_at": "2024-01-01T00:00:00Z"
  },
  "message": "Image uploaded successfully",
  "status": "success"
}
```

#### 2. Get User Images

**Endpoint:** `GET /images`

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in filename and mimetype
- `mimetype` (optional): Filter by specific MIME type

**Example:** `GET /images?page=1&limit=10&search=logo&mimetype=image/jpeg`

**Response:**

```json
{
  "data": {
    "images": [
      {
        "id": "img-uuid-123",
        "url": "https://storage.example.com/path/to/image.jpg",
        "filename": "logo.jpg",
        "path": "user-123/logo.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "uploaded_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  },
  "message": "Images retrieved successfully",
  "status": "success"
}
```

#### 3. Get Specific Image

**Endpoint:** `GET /images/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": {
    "id": "img-uuid-123",
    "url": "https://storage.example.com/path/to/image.jpg",
    "filename": "image.jpg",
    "path": "user-123/image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploaded_at": "2024-01-01T00:00:00Z"
  },
  "message": "Image retrieved successfully",
  "status": "success"
}
```

#### 4. Delete Image

**Endpoint:** `DELETE /images/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": {
    "deleted_id": "img-uuid-123",
    "deleted_url": "https://storage.example.com/path/to/image.jpg"
  },
  "message": "Image deleted successfully",
  "status": "success"
}
```

#### 5. Bulk Delete Images

**Endpoint:** `DELETE /images/bulk`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "image_ids": ["img-uuid-123", "img-uuid-456"]
}
```

**Response:**

```json
{
  "data": {
    "deleted_count": 2,
    "deleted_ids": ["img-uuid-123", "img-uuid-456"]
  },
  "message": "2 images deleted successfully",
  "status": "success"
}
```

### Updated Projects Endpoints

#### Create Project (Updated)

**Endpoint:** `POST /projects`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": "My Awesome Project",
  "description": "A brief description of the project",
  "content": "Detailed project content",
  "status": "planning",
  "technologies": ["tech-uuid-1", "tech-uuid-2"],
  "cover_url": "https://storage.example.com/path/to/cover.jpg",
  "demo_url": "https://demo.example.com",
  "github_url": "https://github.com/user/repo",
  "is_public": true,
  "is_featured": false
}
```

**Response:**

```json
{
  "data": {
    "id": "project-uuid-123",
    "title": "My Awesome Project",
    "description": "A brief description of the project",
    "content": "Detailed project content",
    "status": "planning",
    "user_id": "user-uuid-123",
    "technologies": ["tech-uuid-1", "tech-uuid-2"],
    "likes_count": 0,
    "cover_url": "https://storage.example.com/path/to/cover.jpg",
    "demo_url": "https://demo.example.com",
    "github_url": "https://github.com/user/repo",
    "is_public": true,
    "is_featured": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Project created successfully",
  "status": "success"
}
```

#### Update Project (Updated)

**Endpoint:** `PUT /projects/:id`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": "Updated Project Title",
  "cover_url": "https://storage.example.com/path/to/new-cover.jpg",
  "status": "in_progress"
}
```

**Response:**

```json
{
  "data": {
    "id": "project-uuid-123",
    "title": "Updated Project Title",
    "description": "A brief description of the project",
    "content": "Detailed project content",
    "status": "in_progress",
    "user_id": "user-uuid-123",
    "technologies": ["tech-uuid-1", "tech-uuid-2"],
    "likes_count": 0,
    "cover_url": "https://storage.example.com/path/to/new-cover.jpg",
    "demo_url": "https://demo.example.com",
    "github_url": "https://github.com/user/repo",
    "is_public": true,
    "is_featured": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Project updated successfully",
  "status": "success"
}
```

### Updated Technologies Endpoints

#### Create Technology (Updated)

**Endpoint:** `POST /technologies`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "React",
  "description": "A JavaScript library for building user interfaces",
  "category": "frontend",
  "icon_url": "https://storage.example.com/path/to/react-icon.png",
  "is_active": true
}
```

**Response:**

```json
{
  "data": {
    "id": "tech-uuid-123",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "frontend",
    "icon_url": "https://storage.example.com/path/to/react-icon.png",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Technology created successfully",
  "status": "success"
}
```

#### Update Technology (Updated)

**Endpoint:** `PUT /technologies/:id`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "React.js",
  "icon_url": "https://storage.example.com/path/to/new-react-icon.png"
}
```

**Response:**

```json
{
  "data": {
    "id": "tech-uuid-123",
    "name": "React.js",
    "description": "A JavaScript library for building user interfaces",
    "category": "frontend",
    "icon_url": "https://storage.example.com/path/to/new-react-icon.png",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Technology updated successfully",
  "status": "success"
}
```

## 🔄 Migration Workflow

### New Development Workflow

1. **Upload Images First**

   ```http
   POST /images/upload
   Content-Type: multipart/form-data
   Authorization: Bearer <token>

   file: <binary-data>
   ```

2. **Get Image URLs**

   ```http
   GET /images
   Authorization: Bearer <token>
   ```

3. **Create Project with Cover URL**

   ```http
   POST /projects
   Content-Type: application/json
   Authorization: Bearer <token>

   {
     "title": "My Project",
     "cover_url": "https://storage.example.com/path/to/cover.jpg"
   }
   ```

4. **Create Technology with Icon URL**

   ```http
   POST /technologies
   Content-Type: application/json
   Authorization: Bearer <token>

   {
     "name": "React",
     "icon_url": "https://storage.example.com/path/to/react-icon.png"
   }
   ```

### Frontend Integration

```typescript
// 1. Upload image
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/images/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.data.url; // Get the image URL
};

// 2. Create project with cover URL
const createProject = async (projectData: any, coverUrl: string) => {
  const response = await fetch('/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...projectData,
      cover_url: coverUrl,
    }),
  });

  return response.json();
};

// 3. Complete workflow
const handleProjectCreation = async (projectData: any, coverFile: File) => {
  // Upload image first
  const coverUrl = await uploadImage(coverFile);

  // Create project with cover URL
  const project = await createProject(projectData, coverUrl);

  return project;
};
```

## 🗄️ Database Changes

### New Images Table

```sql
CREATE TABLE images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    size BIGINT NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Updated Projects Table

```sql
-- Remove complex image fields, keep simple cover_url
ALTER TABLE projects DROP COLUMN IF EXISTS images;
ALTER TABLE projects DROP COLUMN IF EXISTS cover;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_url TEXT;
```

### Updated Technologies Table

```sql
-- Technologies already use icon_url, no changes needed
-- icon_url field already exists and is used correctly
```

## 🛡️ Security & Validation

### Image Upload Security

- **File Type Validation**: Only image files (JPEG, PNG, GIF, WebP)
- **File Size Limits**: Maximum 10MB per file
- **User Authentication**: All operations require authentication
- **Ownership Validation**: Users can only manage their own images

### URL Validation

- **Projects**: `cover_url` must be a valid URL
- **Technologies**: `icon_url` must be a valid URL
- **Format Validation**: URLs must follow proper format

## 🚀 Benefits of New Architecture

### 1. **Separation of Concerns**

- Image management is independent of business logic
- Easier to maintain and test
- Clear responsibility boundaries

### 2. **Flexible Workflow**

- Upload images first, assign later
- Reuse images across multiple projects/technologies
- Better user experience

### 3. **Simplified Code**

- No complex file upload logic in projects/technologies
- Cleaner, more focused code
- Easier to understand and maintain

### 4. **Better Performance**

- Dedicated image service with optimized queries
- Efficient image metadata storage
- Better caching strategies

### 5. **Easier Testing**

- Simple URL assignment scenarios
- No complex file upload testing
- Clear test boundaries

## 📊 Error Handling

### Common Error Responses

#### Image Upload Errors

```json
{
  "statusCode": 400,
  "message": "Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/webp",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "File too large. Maximum size: 10MB",
  "error": "Bad Request"
}
```

#### Image Not Found

```json
{
  "statusCode": 404,
  "message": "Image with ID img-uuid-123 not found",
  "error": "Not Found"
}
```

#### Project/Technology Errors

```json
{
  "statusCode": 400,
  "message": "Invalid cover_url format",
  "error": "Bad Request"
}
```

## 🔄 Migration Checklist

### For Developers

- [ ] Update frontend to use new image upload workflow
- [ ] Remove old file upload logic from projects/technologies
- [ ] Update API calls to use new endpoints
- [ ] Test image upload and assignment workflow
- [ ] Update error handling for new responses

### For Database

- [ ] Run migration script: `database/15-create-images-table.sql`
- [ ] Update projects table to use `cover_url`
- [ ] Verify technologies table uses `icon_url`
- [ ] Test database constraints and indexes

### For Testing

- [ ] Test image upload functionality
- [ ] Test image assignment to projects/technologies
- [ ] Test error handling scenarios
- [ ] Test user isolation and security
- [ ] Test bulk operations

## 📚 Related Documentation

- [Images Microservice README](src/images/README.md)
- [Projects Module README](src/projects/README.md)
- [Technologies Module README](src/technologies/README.md)
- [Database Schema](database/README.md)

## 🤝 Support

For questions or issues with the migration:

1. Check the individual module README files
2. Review the API endpoint documentation
3. Test with the provided examples
4. Contact the development team for assistance

---

**Note**: This migration maintains backward compatibility for existing data while providing a cleaner, more maintainable architecture for future development.
