# 📸 Images Microservice

A dedicated microservice for handling image uploads, storage, and management. This service is independent of projects and technologies, allowing you to upload images first and then assign them later.

## 🚀 Features

### Core Functionality

- **Image Upload**: Upload images without project/technology context
- **Image Management**: Get, list, and delete uploaded images
- **User Isolation**: Each user can only manage their own images
- **Bulk Operations**: Delete multiple images at once
- **Search & Filtering**: Find images by filename, type, etc.
- **Pagination**: Efficient data pagination for large image collections

### Security & Validation

- **File Type Validation**: Only allow image files (JPEG, PNG, GIF, WebP)
- **File Size Limits**: Maximum 10MB per file
- **User Authentication**: All operations require authentication
- **Ownership Validation**: Users can only manage their own images

## 📁 File Structure

```
src/images/
├── images.controller.ts      # REST API endpoints
├── images.service.ts         # Business logic
├── images.module.ts          # Module configuration
├── dto/
│   └── images.dto.ts         # Data Transfer Objects
├── types/
│   └── images.types.ts       # TypeScript interfaces
└── README.md                 # This documentation
```

## 🔧 API Endpoints

### Image Management

| Method | Endpoint         | Description            | Auth Required |
| ------ | ---------------- | ---------------------- | ------------- |
| POST   | `/images/upload` | Upload new image       | ✅            |
| GET    | `/images`        | Get user's images      | ✅            |
| GET    | `/images/:id`    | Get specific image     | ✅            |
| DELETE | `/images/:id`    | Delete specific image  | ✅            |
| DELETE | `/images/bulk`   | Delete multiple images | ✅            |

## 🔧 Data Models

### ImageUploadResponse

```typescript
interface ImageUploadResponse {
  id: string;
  url: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploaded_at: string;
}
```

### ImageListResponse

```typescript
interface ImageListResponse {
  images: ImageUploadResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

### ImageDeleteResponse

```typescript
interface ImageDeleteResponse {
  deleted_id: string;
  deleted_url: string;
}
```

## 📝 Request/Response Examples

### Upload Image

**Request:**

```http
POST /images/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

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

### Get User Images

**Request:**

```http
GET /images?page=1&limit=10&search=logo&mimetype=image/jpeg
Authorization: Bearer <token>
```

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

### Delete Image

**Request:**

```http
DELETE /images/img-uuid-123
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

### Bulk Delete Images

**Request:**

```http
DELETE /images/bulk
Content-Type: application/json
Authorization: Bearer <token>

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

## 🛡️ Security & Validation

### Authentication

- All endpoints require authentication
- Users can only manage their own images

### Input Validation

- **File Type**: Only image files (JPEG, PNG, GIF, WebP)
- **File Size**: Maximum 10MB per file
- **File Buffer**: Non-empty file buffer required

### Query Parameters

- **page**: Page number (default: 1)
- **limit**: Items per page (default: 10, max: 100)
- **search**: Search in filename and mimetype
- **mimetype**: Filter by specific MIME type

## 🔄 Business Logic

### Image Upload

1. Validate file type and size
2. Upload to secure storage
3. Store metadata in database
4. Return image information

### Image Retrieval

1. Verify user ownership
2. Apply search and filter criteria
3. Return paginated results

### Image Deletion

1. Verify user ownership
2. Remove from database
3. Return deletion confirmation

## 🧪 Testing

### Test Scenarios

1. **Image Upload**
   - Upload valid image files
   - Upload invalid file types
   - Upload oversized files
   - Upload without authentication

2. **Image Management**
   - Get user's images with pagination
   - Search images by filename
   - Filter images by type
   - Delete specific image
   - Bulk delete images

3. **Security**
   - Access other user's images
   - Delete other user's images
   - Upload without authentication

### Sample Test Data

```typescript
const sampleImage = {
  filename: 'test-image.jpg',
  mimetype: 'image/jpeg',
  size: 1024000,
  url: 'https://storage.example.com/path/to/test-image.jpg',
};
```

## 🚀 Performance Considerations

### Database Optimization

- Indexed fields: `user_id`, `mimetype`, `created_at`, `filename`
- Efficient querying with proper WHERE clauses
- Pagination to limit result sets

### File Storage

- Optimized image storage with CDN
- Unique file naming to prevent conflicts
- Efficient metadata storage

### Caching Strategy

- Image metadata caching for frequently accessed images
- Search result caching for common queries

## 🔧 Configuration

### Environment Variables

```env
# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp

# Storage Configuration
STORAGE_BUCKET=images
STORAGE_FOLDER=uploads
```

### Module Dependencies

- `SupabaseService`: Database operations
- `FileUploadService`: File management
- `AuthModule`: Authentication and authorization

## 📊 Error Handling

### Common Error Responses

```json
{
  "statusCode": 400,
  "message": "Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/webp",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 404,
  "message": "Image with ID img-uuid-123 not found",
  "error": "Not Found"
}
```

## 🔄 Future Enhancements

### Planned Features

- **Image Processing**: Automatic resizing and optimization
- **Image Categories**: Organize images by category
- **Image Tags**: Flexible tagging system
- **Image Sharing**: Share images with other users
- **Image Analytics**: Usage statistics and insights

### Technical Improvements

- **CDN Integration**: Global image delivery
- **Image Compression**: Automatic compression
- **Thumbnail Generation**: Automatic thumbnail creation
- **Image Search**: Advanced search capabilities

## 📚 Related Documentation

- [Main API Documentation](../../README.md)
- [Authentication Module](../auth/README.md)
- [File Upload Service](../file-upload/README.md)
- [Database Schema](../../database/README.md)

## 🤝 Contributing

When contributing to the Images microservice:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new features
3. Update this documentation for any changes
4. Ensure all validations are properly implemented
5. Test file upload functionality thoroughly

## 📄 License

This microservice is part of the Flexify Server project and follows the same MIT License.
