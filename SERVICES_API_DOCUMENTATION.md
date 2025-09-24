# 🛠️ Services API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the Services management endpoints in the Flexify backend service. The Services service allows administrators to manage service information including name, icon URL, description, and href links.

## 🔐 Authentication

All service management endpoints require JWT authentication with **ADMIN** role. Include the token in the Authorization header:

```
Authorization: Bearer <your_admin_jwt_token>
```

**Note**: Create, Update, and Delete operations are restricted to admin users only for security reasons.

## 🗂️ Base URL

```
{{base_url}} = http://localhost:3000/api/v1
```

---

## 📝 API Endpoints

### 1. 🆕 **Create Service (Admin Only)**

**Endpoint**: `POST /api/v1/services`

**Authentication**: Required (Admin)

**Description**: Create a new service with name, icon URL, description, and href.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Web Development",
  "icon_url": "https://example.com/icon.png",
  "description": "Professional web development services",
  "href": "https://example.com/web-development",
  "is_active": true
}
```

**Field Descriptions**:

- `name` (required): Service name (max 255 characters)
- `icon_url` (optional): URL to service icon image (must be valid URL)
- `description` (optional): Service description (max 1000 characters)
- `href` (optional): Service link/URL (must be valid URL)
- `is_active` (optional): Whether the service is active (default: true)

**Response (201 Created)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Web Development",
    "icon_url": "https://example.com/icon.png",
    "description": "Professional web development services",
    "href": "https://example.com/web-development",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Service created successfully",
  "status": "success"
}
```

### 2. 📋 **Get All Services**

**Endpoint**: `GET /api/v1/services`

**Authentication**: Not required

**Description**: Get a paginated list of all services with optional filtering and sorting.

**Query Parameters**:

- `is_active` (boolean, optional): Filter by active status
- `search` (string, optional): Search term for name or description
- `page` (number, optional): Page number (default: 1, minimum: 1)
- `limit` (number, optional): Items per page (default: 10, minimum: 1, maximum: 100)
- `sort_by` (string, optional): Sort by field (`name`, `is_active`, `created_at`, `updated_at`)
- `sort_order` (string, optional): Sort order (`asc`, `desc`)

**Example Requests**:

```
GET /api/v1/services
GET /api/v1/services?is_active=true&page=1&limit=5
GET /api/v1/services?search=web&sort_by=name&sort_order=asc
```

**Response (200 OK)**:

```json
{
  "data": {
    "services": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Web Development",
        "icon_url": "https://example.com/icon.png",
        "description": "Professional web development services",
        "href": "https://example.com/web-development",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  },
  "message": "Services retrieved successfully",
  "status": "success"
}
```

### 3. 🔍 **Get Service by ID**

**Endpoint**: `GET /api/v1/services/:id`

**Authentication**: Not required

**Description**: Get a specific service by its ID.

**Path Parameters**:

- `id` (string, required): Service UUID

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Web Development",
    "icon_url": "https://example.com/icon.png",
    "description": "Professional web development services",
    "href": "https://example.com/web-development",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Service retrieved successfully",
  "status": "success"
}
```

**Response (404 Not Found)**:

```json
{
  "message": "Service not found",
  "statusCode": 404
}
```

### 4. ✏️ **Update Service (Admin Only)**

**Endpoint**: `PUT /api/v1/services/:id`

**Authentication**: Required (Admin)

**Description**: Update a service by ID. All fields are optional.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body** (all fields optional):

```json
{
  "name": "Updated Web Development",
  "icon_url": "https://example.com/new-icon.png",
  "description": "Updated professional web development services",
  "href": "https://example.com/updated-web-development",
  "is_active": false
}
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Web Development",
    "icon_url": "https://example.com/new-icon.png",
    "description": "Updated professional web development services",
    "href": "https://example.com/updated-web-development",
    "is_active": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Service updated successfully",
  "status": "success"
}
```

### 5. 🗑️ **Delete Service (Admin Only)**

**Endpoint**: `DELETE /api/v1/services/:id`

**Authentication**: Required (Admin)

**Description**: Delete a service by ID.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
```

**Response (204 No Content)**:

```
No content
```

---

## 🔍 Query Filtering Examples

### Filter by Active Status

```
GET /api/v1/services?is_active=true
```

### Search Services

```
GET /api/v1/services?search=web development
```

### Pagination

```
GET /api/v1/services?page=2&limit=5
```

### Sorting

```
GET /api/v1/services?sort_by=name&sort_order=asc
GET /api/v1/services?sort_by=created_at&sort_order=desc
```

### Combined Filters

```
GET /api/v1/services?is_active=true&search=web&page=1&limit=10&sort_by=name&sort_order=asc
```

---

## 📊 Response Schemas

### Service Object

```json
{
  "id": "string (UUID)",
  "name": "string",
  "icon_url": "string (URL, optional)",
  "description": "string (optional)",
  "href": "string (URL, optional)",
  "is_active": "boolean",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Services List Response

```json
{
  "services": "Service[]",
  "total": "number",
  "page": "number",
  "limit": "number",
  "total_pages": "number"
}
```

---

## 🚨 Error Responses

### 400 Bad Request

```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden

```json
{
  "message": "Forbidden - Admin access required",
  "statusCode": 403
}
```

### 404 Not Found

```json
{
  "message": "Service not found",
  "statusCode": 404
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## 🛡️ Security Considerations

### Admin-Only Access

- Create, Update, and Delete operations require admin authentication
- JWT tokens are validated for admin role
- Unauthorized access attempts are logged

### Data Validation

- All input data is validated using class-validator decorators
- URL fields are validated for proper URL format
- String length limits are enforced
- Required fields are properly validated

### Database Security

- Row Level Security (RLS) is enabled on the services table
- All operations are logged with timestamps
- Proper error handling prevents information leakage

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:3000/api/docs` (when running)
- **Health Check**: `http://localhost:3000/api/v1/health`
- **Database Schema**: See `database/18-create-services-table.sql`
- **Authentication Endpoints**: See `AUTH_ENDPOINTS_DOCUMENTATION.md`

---

## 🎯 Use Cases

### 1. Service Management

- Create new services with complete information
- Update service details and status
- Delete outdated or unused services

### 2. Public Service Listing

- Display all active services to users
- Filter services by status
- Search for specific services

### 3. Admin Dashboard

- Manage service visibility and status
- Monitor service usage and performance
- Bulk operations on services

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Maintainer**: Flexify Development Team
