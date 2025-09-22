# Technologies Module API Documentation

This module provides CRUD operations for managing technologies in the system. It includes endpoints for creating, reading, updating, and deleting technologies, as well as uploading technology icons.

## Base URL

All endpoints are prefixed with `/technologies`

## Authentication

Most endpoints require authentication using the `AuthGuard`. The authentication token should be included in the request headers.

## Endpoints

### 1. Create Technology

**POST** `/technologies`

Creates a new technology with optional icon upload.

#### Request Body

```json
{
  "name": "string (required)",
  "description": "string (optional, max 150 chars)",
  "category": "TechnologyCategory (required)",
  "icon_url": "string (optional)",
  "is_active": "boolean (optional, default: true)"
}
```

#### Form Data (for icon upload)

- `icon`: File (optional, max 2MB)

#### Technology Categories

- `Frontend`
- `Backend`
- `Database`
- `DevOps`
- `Mobile`
- `Desktop`
- `Cloud`
- `AI/ML`
- `Other`

#### Response

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "TechnologyCategory",
    "icon_url": "string",
    "is_active": "boolean",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)"
  },
  "message": "Technology created successfully",
  "status": "success"
}
```

#### Status Codes

- `201` - Created successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized

---

### 2. Upload Technology Icon

**POST** `/technologies/:id/icon`

Uploads an icon for an existing technology.

#### Path Parameters

- `id`: string (required) - Technology ID

#### Form Data

- `icon`: File (required, max 2MB)

#### Response

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "TechnologyCategory",
    "icon_url": "string",
    "is_active": "boolean",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)"
  },
  "message": "Technology updated successfully",
  "status": "success"
}
```

#### Status Codes

- `200` - Updated successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized
- `404` - Technology not found

---

### 3. Get All Technologies

**GET** `/technologies`

Retrieves a paginated list of technologies with optional filtering and sorting.

#### Query Parameters

- `category`: TechnologyCategory (optional) - Filter by category
- `is_active`: boolean (optional) - Filter by active status
- `search`: string (optional) - Search in name and description
- `page`: number (optional, default: 1) - Page number (min: 1)
- `limit`: number (optional, default: 10) - Items per page (min: 1, max: 100)
- `sort_by`: string (optional, default: "name") - Field to sort by
- `sort_order`: "asc" | "desc" (optional, default: "asc") - Sort direction

#### Example Request

```
GET /technologies?category=Frontend&is_active=true&search=react&page=1&limit=10&sort_by=name&sort_order=asc
```

#### Response

```json
{
  "data": {
    "technologies": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "TechnologyCategory",
        "icon_url": "string",
        "is_active": "boolean",
        "created_at": "string (ISO date)",
        "updated_at": "string (ISO date)"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "total_pages": "number"
  },
  "message": "Technologies retrieved successfully",
  "status": "success"
}
```

#### Status Codes

- `200` - Retrieved successfully
- `400` - Bad request (validation errors)

---

### 4. Get Technology by ID

**GET** `/technologies/:id`

Retrieves a specific technology by its ID.

#### Path Parameters

- `id`: string (required) - Technology ID

#### Response

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "TechnologyCategory",
    "icon_url": "string",
    "is_active": "boolean",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)"
  },
  "message": "Technology retrieved successfully",
  "status": "success"
}
```

#### Status Codes

- `200` - Retrieved successfully
- `400` - Bad request
- `404` - Technology not found

---

### 5. Update Technology

**PUT** `/technologies/:id`

Updates an existing technology.

#### Path Parameters

- `id`: string (required) - Technology ID

#### Request Body

```json
{
  "name": "string (optional)",
  "description": "string (optional, max 150 chars)",
  "category": "TechnologyCategory (optional)",
  "icon_url": "string (optional)",
  "is_active": "boolean (optional)"
}
```

#### Response

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "TechnologyCategory",
    "icon_url": "string",
    "is_active": "boolean",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)"
  },
  "message": "Technology updated successfully",
  "status": "success"
}
```

#### Status Codes

- `200` - Updated successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized
- `404` - Technology not found

---

### 6. Delete Technology

**DELETE** `/technologies/:id`

Deletes a technology by its ID.

#### Path Parameters

- `id`: string (required) - Technology ID

#### Response

```json
{
  "data": null,
  "message": "Technology deleted successfully",
  "status": "success"
}
```

#### Status Codes

- `204` - Deleted successfully
- `401` - Unauthorized
- `404` - Technology not found

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "statusCode": "number",
  "message": "string | string[]",
  "error": "string"
}
```

## File Upload Specifications

- **Maximum file size**: 2MB
- **Supported formats**: Any image format supported by the file upload service
- **Field name**: `icon`
- **Content-Type**: `multipart/form-data`

## Notes

1. All timestamps are in ISO 8601 format
2. The `icon_url`, `icon_filename`, and `icon_size` fields are automatically populated when an icon is uploaded
3. Search functionality works on both `name` and `description` fields using case-insensitive matching
4. Pagination is 1-indexed (page 1 is the first page)
5. All string fields are trimmed of whitespace
6. The `is_active` field defaults to `true` when creating a new technology
