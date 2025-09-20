# 🚀 Technologies API Endpoints Documentation

## 📋 Overview

This document provides comprehensive documentation for all Technology API endpoints in the Flexify backend service. The Technologies service manages predefined technologies that can be used in projects, ensuring data consistency and validation.

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Note**: Public endpoints (GET requests) don't require authentication.

## 🗂️ Base URL

```
{{base_url}} = http://localhost:3000/api/v1
```

---

## 📝 API Endpoints

### 1. 🔒 **Create Technology (Admin Only)**

**Endpoint**: `POST /api/v1/technologies`

**Authentication**: Required (Admin)

**Description**: Create a new technology entry in the system.

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body**:

```json
{
  "name": "React",
  "description": "A JavaScript library for building user interfaces",
  "category": "Frontend",
  "icon_url": "https://example.com/react-icon.png",
  "is_active": true
}
```

**Request Body Schema**:

- `name` (string, required): Technology name
- `description` (string, optional): Technology description
- `category` (string, optional): Technology category
- `icon_url` (string, optional): Icon URL
- `is_active` (boolean, optional): Is technology active (default: true)

**Response (201 Created)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend",
    "icon_url": "https://example.com/react-icon.png",
    "is_active": true,
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "message": "Technology created successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data or technology already exists
- `401 Unauthorized`: Missing or invalid JWT token

---

### 2. 🌐 **Get Technologies (Paginated)**

**Endpoint**: `GET /api/v1/technologies`

**Authentication**: Not required

**Description**: Get a paginated list of technologies with optional filtering and search.

**Query Parameters**:

- `category` (string, optional): Filter by category
- `is_active` (boolean, optional): Filter by active status
- `search` (string, optional): Search term for name, description, or category
- `page` (number, optional): Page number (default: 1, minimum: 1)
- `limit` (number, optional): Items per page (default: 10, minimum: 1, maximum: 100)
- `sort_by` (string, optional): Sort by field (`name`, `category`, `created_at`)
- `sort_order` (string, optional): Sort order (`asc`, `desc`)

**Example Requests**:

```
GET /api/v1/technologies
GET /api/v1/technologies?category=Frontend&is_active=true
GET /api/v1/technologies?search=react&page=1&limit=5
GET /api/v1/technologies?sort_by=name&sort_order=asc
```

**Response (200 OK)**:

```json
{
  "data": {
    "technologies": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "React",
        "description": "A JavaScript library for building user interfaces",
        "category": "Frontend",
        "icon_url": "https://example.com/react-icon.png",
        "is_active": true,
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  },
  "message": "Technologies retrieved successfully",
  "status": "success"
}
```

---

### 3. 🌐 **Get Active Technologies**

**Endpoint**: `GET /api/v1/technologies/active`

**Authentication**: Not required

**Description**: Get all active technologies without pagination.

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "category": "Frontend",
      "icon_url": "https://example.com/react-icon.png",
      "is_active": true,
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    }
  ],
  "message": "Active technologies retrieved successfully",
  "status": "success"
}
```

---

### 4. 🌐 **Search Technologies**

**Endpoint**: `GET /api/v1/technologies/search`

**Authentication**: Not required

**Description**: Search technologies by name, description, or category.

**Query Parameters**:

- `q` (string, required): Search term

**Example Request**:

```
GET /api/v1/technologies/search?q=react
```

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "category": "Frontend",
      "icon_url": "https://example.com/react-icon.png",
      "is_active": true,
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    }
  ],
  "message": "Search results retrieved successfully",
  "status": "success"
}
```

---

### 5. 🌐 **Get Technologies by Category**

**Endpoint**: `GET /api/v1/technologies/category/:category`

**Authentication**: Not required

**Description**: Get all active technologies in a specific category.

**Path Parameters**:

- `category` (string, required): Category name

**Example Request**:

```
GET /api/v1/technologies/category/Frontend
```

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "category": "Frontend",
      "icon_url": "https://example.com/react-icon.png",
      "is_active": true,
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    }
  ],
  "message": "Technologies retrieved successfully",
  "status": "success"
}
```

---

### 6. 🌐 **Get Technology by ID**

**Endpoint**: `GET /api/v1/technologies/:id`

**Authentication**: Not required

**Description**: Get a specific technology by its ID.

**Path Parameters**:

- `id` (string, required): Technology UUID

**Example Request**:

```
GET /api/v1/technologies/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend",
    "icon_url": "https://example.com/react-icon.png",
    "is_active": true,
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "message": "Technology retrieved successfully",
  "status": "success"
}
```

**Error Response (404 Not Found)**:

```json
{
  "statusCode": 404,
  "message": "Technology not found",
  "error": "Not Found"
}
```

---

### 7. 🔒 **Update Technology (Admin Only)**

**Endpoint**: `PUT /api/v1/technologies/:id`

**Authentication**: Required (Admin)

**Description**: Update an existing technology.

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Technology UUID

**Request Body**:

```json
{
  "name": "React v18",
  "description": "A JavaScript library for building user interfaces - Latest version",
  "category": "Frontend",
  "icon_url": "https://example.com/react-v18-icon.png",
  "is_active": true
}
```

**Request Body Schema**:

- `name` (string, optional): Technology name
- `description` (string, optional): Technology description
- `category` (string, optional): Technology category
- `icon_url` (string, optional): Icon URL
- `is_active` (boolean, optional): Is technology active

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React v18",
    "description": "A JavaScript library for building user interfaces - Latest version",
    "category": "Frontend",
    "icon_url": "https://example.com/react-v18-icon.png",
    "is_active": true,
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:35:00.000Z"
  },
  "message": "Technology updated successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data or name conflict
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Technology not found

---

### 8. 🔒 **Delete Technology (Admin Only)**

**Endpoint**: `DELETE /api/v1/technologies/:id`

**Authentication**: Required (Admin)

**Description**: Delete a technology from the system.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Technology UUID

**Example Request**:

```
DELETE /api/v1/technologies/123e4567-e89b-12d3-a456-426614174000
```

**Response (204 No Content)**:
No response body

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Technology not found

---

### 9. 🔒 **Upload Technology Icon (Admin Only)**

**Endpoint**: `POST /api/v1/technologies/:id/icon`

**Authentication**: Required (Admin)

**Description**: Upload an icon file for a technology.

**Request Headers**:

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Technology UUID

**Request Body**:

- `file` (file, required): Icon image file (PNG, JPG, SVG, ICO, etc., max 2MB)

**Example Request**:

```
POST /api/v1/technologies/123e4567-e89b-12d3-a456-426614174000/icon
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Form Data:
- file: [icon-file.png]
```

**Response (201 Created)**:

```json
{
  "data": {
    "url": "https://supabase-storage-url/technologies/123e4567-e89b-12d3-a456-426614174000/icon.png",
    "path": "technologies/123e4567-e89b-12d3-a456-426614174000/icon.png",
    "filename": "icon_1234567890.png"
  },
  "message": "Technology icon uploaded successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid file or file too large
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Technology not found

---

## 📊 Data Models

### Technology Entity

```typescript
interface Technology {
  id: string; // UUID primary key
  name: string; // Technology name
  description?: string; // Technology description
  category?: string; // Technology category
  icon_url?: string; // Icon URL
  icon_filename?: string; // Icon filename
  icon_size?: number; // Icon file size in bytes
  icon_uploaded_at?: string; // Icon upload timestamp
  is_active: boolean; // Is technology active
  created_at: string; // Creation timestamp
  updated_at: string; // Last update timestamp
}
```

### Create Technology Request

```typescript
interface CreateTechnologyRequest {
  name: string; // Required
  description?: string; // Optional
  category?: string; // Optional
  icon_url?: string; // Optional
  is_active?: boolean; // Optional (default: true)
}
```

### Update Technology Request

```typescript
interface UpdateTechnologyRequest {
  name?: string; // Optional
  description?: string; // Optional
  category?: string; // Optional
  icon_url?: string; // Optional
  is_active?: boolean; // Optional
}
```

### Technology Query Parameters

```typescript
interface TechnologyQuery {
  category?: string; // Filter by category
  is_active?: boolean; // Filter by active status
  search?: string; // Search term
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 10)
  sort_by?: 'name' | 'category' | 'created_at'; // Sort field
  sort_order?: 'asc' | 'desc'; // Sort order
}
```

### Technology List Response

```typescript
interface TechnologyListResponse {
  technologies: Technology[]; // Array of technologies
  total: number; // Total count
  page: number; // Current page
  limit: number; // Items per page
  total_pages: number; // Total pages
}
```

### Standard Response

```typescript
interface StandardResponse<T> {
  data: T; // Response data
  message: string; // Response message
  status: string; // Response status
}
```

---

## 🚨 Error Codes

| Status Code | Error Type            | Description                             |
| ----------- | --------------------- | --------------------------------------- |
| `200`       | OK                    | Request successful                      |
| `201`       | Created               | Resource created successfully           |
| `204`       | No Content            | Resource deleted successfully           |
| `400`       | Bad Request           | Invalid input data or validation errors |
| `401`       | Unauthorized          | Missing or invalid JWT token            |
| `404`       | Not Found             | Resource not found                      |
| `500`       | Internal Server Error | Server-side error                       |

---

## 🧪 Testing Examples

### 1. Create Technology

```bash
curl -X POST "http://localhost:3000/api/v1/technologies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Vue.js",
    "description": "A progressive JavaScript framework",
    "category": "Frontend",
    "icon_url": "https://example.com/vue-icon.png",
    "is_active": true
  }'
```

### 2. Get Technologies with Filters

```bash
curl -X GET "http://localhost:3000/api/v1/technologies?category=Frontend&is_active=true&page=1&limit=5" \
  -H "Accept: application/json"
```

### 3. Search Technologies

```bash
curl -X GET "http://localhost:3000/api/v1/technologies/search?q=react" \
  -H "Accept: application/json"
```

### 4. Update Technology

```bash
curl -X PUT "http://localhost:3000/api/v1/technologies/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Vue.js v3",
    "description": "A progressive JavaScript framework - Version 3",
    "is_active": true
  }'
```

### 5. Upload Technology Icon

```bash
curl -X POST "http://localhost:3000/api/v1/technologies/123e4567-e89b-12d3-a456-426614174000/icon" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/icon.png"
```

### 6. Delete Technology

```bash
curl -X DELETE "http://localhost:3000/api/v1/technologies/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Configuration

### File Upload Limits

- **Maximum file size**: 2MB
- **Allowed file types**: PNG, JPG, SVG, ICO, and other image formats
- **Storage**: Supabase Storage

### Pagination Defaults

- **Default page size**: 10 items
- **Maximum page size**: 100 items
- **Default page**: 1

### Search Configuration

- **Search fields**: name, description, category
- **Case sensitivity**: Case-insensitive
- **Search type**: Partial match (ILIKE)

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:3000/api` (when running)
- **Health Check**: `http://localhost:3000/api/health`
- **Database Schema**: See `database/12-add-technology-icons.sql`

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Maintainer**: Flexify Development Team
