# Projects Module

A comprehensive project management module for the Flexify Server API, built with NestJS. This module handles project portfolio management, including CRUD operations, file uploads, likes system, and project categorization.

## 📁 Module Structure

```
src/projects/
├── dto/
│   └── projects.dto.ts          # Data Transfer Objects for validation
├── enums/
│   └── index.ts                 # Project status enumerations
├── types/
│   └── projects.types.ts        # TypeScript interfaces and types
├── projects.controller.ts       # REST API endpoints
├── projects.service.ts          # Business logic and data operations
├── projects.module.ts           # Module configuration
└── README.md                    # This documentation
```

## 🚀 Features

### Core Functionality

- **Project CRUD Operations**: Create, read, update, and delete projects
- **Project Status Management**: Planning, Active, In Progress, Completed
- **Technology Integration**: Associate projects with technologies
- **Simple Cover Management**: Single cover image per project (like technologies icon_url)
- **Likes System**: Users can like/unlike projects
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient data pagination for large datasets

### Simplified Cover Management

- **Single Cover**: One cover image per project (similar to technologies icon_url)
- **Simple Upload**: Easy cover upload and replacement
- **Cover Retrieval**: Get project cover URL
- **Cover Deletion**: Remove project cover
- **Clean Architecture**: Simple and maintainable code structure

### Security & Validation

- **Authentication Required**: Protected endpoints for project management
- **Ownership Validation**: Users can only modify their own projects
- **Input Validation**: Comprehensive DTO validation with class-validator
- **File Upload Security**: File type and size validation with detailed error messages
- **URL Validation**: Proper URL validation for external links
- **Image Type Validation**: Strict validation for supported image formats

## 📋 API Endpoints

### Project Management

| Method | Endpoint        | Description        | Auth Required | Owner Only |
| ------ | --------------- | ------------------ | ------------- | ---------- |
| POST   | `/projects`     | Create new project | ✅            | -          |
| GET    | `/projects`     | Get projects list  | ❌            | -          |
| GET    | `/projects/:id` | Get project by ID  | ❌            | -          |
| PUT    | `/projects/:id` | Update project     | ✅            | ✅         |
| DELETE | `/projects/:id` | Delete project     | ✅            | ✅         |

### Project Interactions

| Method | Endpoint         | Description         | Auth Required |
| ------ | ---------------- | ------------------- | ------------- |
| POST   | `/projects/like` | Like/unlike project | ✅            |

### Cover Management

| Method | Endpoint              | Description          | Auth Required | Owner Only |
| ------ | --------------------- | -------------------- | ------------- | ---------- |
| POST   | `/projects/:id/cover` | Upload project cover | ✅            | ✅         |
| GET    | `/projects/:id/cover` | Get project cover    | ❌            | -          |
| DELETE | `/projects/:id/cover` | Delete project cover | ✅            | ✅         |

## 🔧 Data Models

### Project Interface

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
  cover_url?: string;
  demo_url?: string;
  github_url?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}
```

### Project Status Enum

```typescript
enum ProjectStatus {
  Planning = 'planning',
  Active = 'active',
  InProgress = 'in_progress',
  Completed = 'completed',
}
```

### Cover Management Types

```typescript
interface ProjectCoverUploadResponse {
  cover_url: string;
  previous_cover_url?: string;
}
```

## 📝 Request/Response Examples

### Create Project

**Request:**

```http
POST /projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "My Awesome Project",
  "description": "A brief description of the project",
  "content": "Detailed project content",
  "status": "planning",
  "technologies": ["uuid1", "uuid2"],
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
    "id": "project-uuid",
    "title": "My Awesome Project",
    "description": "A brief description of the project",
    "content": "Detailed project content",
    "status": "planning",
    "user_id": "user-uuid",
    "technologies": ["uuid1", "uuid2"],
    "likes_count": 0,
    "cover_url": null,
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

### Get Projects with Query Parameters

**Request:**

```http
GET /projects?status=active&is_public=true&page=1&limit=10&sort_by=created_at&sort_order=desc
```

**Response:**

```json
{
  "data": {
    "projects": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3
  },
  "message": "Projects retrieved successfully",
  "status": "success"
}
```

### Like Project

**Request:**

```http
POST /projects/like
Content-Type: application/json
Authorization: Bearer <token>

{
  "project_id": "project-uuid"
}
```

**Response:**

```json
{
  "data": {
    "id": "like-uuid",
    "project_id": "project-uuid",
    "user_id": "user-uuid",
    "is_like": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Project liked successfully",
  "status": "success"
}
```

## 🔍 Query Parameters

### Project Query Options

| Parameter     | Type    | Description                         | Example              |
| ------------- | ------- | ----------------------------------- | -------------------- |
| `status`      | string  | Filter by project status            | `status=active`      |
| `is_public`   | boolean | Filter public/private projects      | `is_public=true`     |
| `is_featured` | boolean | Filter featured projects            | `is_featured=true`   |
| `user_id`     | string  | Filter by user ID                   | `user_id=uuid`       |
| `search`      | string  | Search in title/description/content | `search=react`       |
| `page`        | number  | Page number (default: 1)            | `page=2`             |
| `limit`       | number  | Items per page (1-100, default: 10) | `limit=20`           |
| `sort_by`     | string  | Sort field                          | `sort_by=created_at` |
| `sort_order`  | string  | Sort direction (asc/desc)           | `sort_order=desc`    |

### Valid Sort Fields

- `title`
- `status`
- `likes_count`
- `created_at`
- `updated_at`

## 📁 Cover Upload

### Supported File Types

- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Maximum Size**: 10MB per file
- **Single Cover**: One cover image per project

### Upload Project Cover

**Request:**

```http
POST /projects/:id/cover
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary-data>
```

**Response:**

```json
{
  "data": {
    "cover_url": "https://storage.example.com/path/to/cover.jpg",
    "previous_cover_url": "https://old-cover-url.com/old-cover.jpg"
  },
  "message": "Project cover uploaded successfully",
  "status": "success"
}
```

### Get Project Cover

**Request:**

```http
GET /projects/:id/cover
```

**Response:**

```json
{
  "data": "https://storage.example.com/path/to/cover.jpg",
  "message": "Project cover retrieved successfully",
  "status": "success"
}
```

### Delete Project Cover

**Request:**

```http
DELETE /projects/:id/cover
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": {
    "deleted_cover_url": "https://storage.example.com/path/to/cover.jpg"
  },
  "message": "Project cover deleted successfully",
  "status": "success"
}
```

## 🛡️ Security & Validation

### Authentication

- All project management endpoints require authentication
- Users can only modify their own projects
- File uploads are restricted to project owners

### Input Validation

- **Title**: Required, non-empty string
- **Description**: Optional, non-empty string
- **Content**: Optional, non-empty string
- **Status**: Must be valid ProjectStatus enum value
- **Technologies**: Array of valid UUIDs
- **Cover URL**: Valid URL format
- **Demo URL**: Valid URL format
- **GitHub URL**: Valid URL format
- **Likes Count**: Non-negative number
- **Public/Featured**: Boolean values

### File Upload Security

- File type validation (images only)
- File size limits (10MB max)
- Single cover per project
- Secure file storage with unique naming

## 🔄 Business Logic

### Project Creation

1. Validate input data
2. Set default values (status: planning, likes_count: 0)
3. Create project record
4. Return created project data

### Project Updates

1. Verify project exists
2. Check user ownership
3. Update project fields
4. Return updated project data

### Project Deletion

1. Verify project exists
2. Check user ownership
3. Delete project record
4. Return success confirmation

### Like System

1. Check if user already liked the project
2. If liked: Remove like and decrement count
3. If not liked: Add like and increment count
4. Update project likes_count field
5. Return like status

### Cover Management

1. Verify project ownership
2. Validate file type and size
3. Upload to secure storage
4. Update project record with cover URL
5. Return upload result

## 🧪 Testing

### Test Scenarios

1. **Project CRUD Operations**
   - Create project with valid data
   - Create project with invalid data
   - Update project (owner vs non-owner)
   - Delete project (owner vs non-owner)

2. **Cover Upload**
   - Upload valid cover image
   - Upload invalid file types
   - Upload oversized files
   - Upload to non-owned project

3. **Like System**
   - Like project (first time)
   - Unlike project
   - Like project (already liked)
   - Like non-existent project

4. **Query & Filtering**
   - Filter by status
   - Filter by public/private
   - Search functionality
   - Pagination
   - Sorting

### Sample Test Data

```typescript
const sampleProject = {
  title: 'Test Project',
  description: 'A test project for development',
  content: 'Detailed content about the test project',
  status: 'planning',
  technologies: ['tech-uuid-1', 'tech-uuid-2'],
  cover_url: 'https://storage.example.com/cover.jpg',
  demo_url: 'https://demo.example.com',
  github_url: 'https://github.com/user/repo',
  is_public: true,
  is_featured: false,
};
```

## 🚀 Performance Considerations

### Database Optimization

- Indexed fields: `user_id`, `status`, `is_public`, `is_featured`, `likes_count`, `created_at`
- Efficient querying with proper WHERE clauses
- Pagination to limit result sets

### File Storage

- Optimized cover storage with CDN
- Unique file naming to prevent conflicts
- Simple cover URL management

### Caching Strategy

- Project data caching for frequently accessed projects
- Search result caching for common queries
- Cover URL caching for better performance

## 🔧 Configuration

### Environment Variables

```env
# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp

# Storage Configuration
STORAGE_BUCKET=project-covers
STORAGE_FOLDER=projects
```

### Module Dependencies

- `SupabaseService`: Database operations
- `FileUploadService`: File management
- `ProjectCoverService`: Cover management
- `AuthModule`: Authentication and authorization

## 📊 Error Handling

### Common Error Responses

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 403,
  "message": "You can only update your own projects",
  "error": "Forbidden"
}
```

```json
{
  "statusCode": 404,
  "message": "Project with ID project-uuid not found",
  "error": "Not Found"
}
```

## 🔄 Future Enhancements

### Planned Features

- **Project Categories**: Categorize projects by type
- **Project Tags**: Flexible tagging system
- **Project Collaboration**: Multi-user project editing
- **Project Templates**: Reusable project templates
- **Advanced Analytics**: Project view and interaction analytics
- **Project Export**: Export projects to various formats
- **Project Import**: Import projects from external sources

### Technical Improvements

- **Real-time Updates**: WebSocket support for live updates
- **Advanced Search**: Full-text search with Elasticsearch
- **Cover Processing**: Automatic image optimization and resizing
- **Version Control**: Project versioning and history
- **API Rate Limiting**: Enhanced rate limiting for file uploads

## 📚 Related Documentation

- [Main API Documentation](../../README.md)
- [Authentication Module](../auth/README.md)
- [Technologies Module](../technologies/README.md)
- [File Upload Service](../file-upload/README.md)
- [Database Schema](../../database/README.md)

## 🤝 Contributing

When contributing to the Projects module:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new features
3. Update this documentation for any changes
4. Ensure all validations are properly implemented
5. Test cover upload functionality thoroughly

## 📄 License

This module is part of the Flexify Server project and follows the same MIT License.

---

**Projects Module** - Built with ❤️ using NestJS and modern web technologies.
