# Technologies API - Postman Documentation

## 📋 **Overview**

This document provides comprehensive Postman collection documentation for the Technologies API endpoints. The API allows you to manage technology stacks with full CRUD operations, search functionality, and category filtering.

## 🔧 **Base Configuration**

### **Environment Variables**

Create a Postman environment with these variables:

| Variable     | Value                          | Description                          |
| ------------ | ------------------------------ | ------------------------------------ |
| `base_url`   | `http://localhost:3000/api/v1` | Base API URL                         |
| `auth_token` | `your_jwt_token_here`          | JWT token for authenticated requests |

### **Headers**

For all requests, set these headers:

| Key             | Value                   | Description                         |
| --------------- | ----------------------- | ----------------------------------- |
| `Content-Type`  | `application/json`      | Request content type                |
| `Authorization` | `Bearer {{auth_token}}` | JWT token (for protected endpoints) |

## 🚀 **API Endpoints**

### **1. Get All Technologies**

**Method:** `GET`  
**URL:** `{{base_url}}/technologies`  
**Authentication:** Not required  
**Description:** Get a paginated list of technologies with optional filtering

#### **Query Parameters:**

| Parameter    | Type    | Required | Default | Description                                      |
| ------------ | ------- | -------- | ------- | ------------------------------------------------ |
| `category`   | string  | No       | -       | Filter by category (e.g., "Frontend", "Backend") |
| `is_active`  | boolean | No       | -       | Filter by active status                          |
| `search`     | string  | No       | -       | Search term for name or description              |
| `page`       | number  | No       | 1       | Page number                                      |
| `limit`      | number  | No       | 10      | Items per page (1-100)                           |
| `sort_by`    | string  | No       | "name"  | Sort by field                                    |
| `sort_order` | string  | No       | "asc"   | Sort order ("asc" or "desc")                     |

#### **Example Requests:**

```bash
# Get all technologies
GET {{base_url}}/technologies

# Get frontend technologies
GET {{base_url}}/technologies?category=Frontend

# Search for React technologies
GET {{base_url}}/technologies?search=react

# Get active technologies with pagination
GET {{base_url}}/technologies?is_active=true&page=1&limit=5

# Sort by name descending
GET {{base_url}}/technologies?sort_by=name&sort_order=desc
```

#### **Response Example:**

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
        "icon_filename": "react-icon.png",
        "icon_size": 1024,
        "is_active": true,
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
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

### **2. Get Active Technologies**

**Method:** `GET`  
**URL:** `{{base_url}}/technologies/active`  
**Authentication:** Not required  
**Description:** Get all active technologies

#### **Example Request:**

```bash
GET {{base_url}}/technologies/active
```

#### **Response Example:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "category": "Frontend",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "Active technologies retrieved successfully",
  "status": "success"
}
```

---

### **3. Search Technologies**

**Method:** `GET`  
**URL:** `{{base_url}}/technologies/search`  
**Authentication:** Not required  
**Description:** Search technologies by name, description, or category

#### **Query Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `q`       | string | Yes      | Search term |

#### **Example Requests:**

```bash
# Search for React
GET {{base_url}}/technologies/search?q=react

# Search for JavaScript
GET {{base_url}}/technologies/search?q=javascript

# Search for database
GET {{base_url}}/technologies/search?q=database
```

#### **Response Example:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "category": "Frontend",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "Search results retrieved successfully",
  "status": "success"
}
```

---

### **4. Get Technologies by Category**

**Method:** `GET`  
**URL:** `{{base_url}}/technologies/category/{category}`  
**Authentication:** Not required  
**Description:** Get all active technologies in a specific category

#### **Path Parameters:**

| Parameter  | Type   | Required | Description                                             |
| ---------- | ------ | -------- | ------------------------------------------------------- |
| `category` | string | Yes      | Category name (e.g., "Frontend", "Backend", "Database") |

#### **Example Requests:**

```bash
# Get frontend technologies
GET {{base_url}}/technologies/category/Frontend

# Get backend technologies
GET {{base_url}}/technologies/category/Backend

# Get database technologies
GET {{base_url}}/technologies/category/Database
```

#### **Response Example:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "category": "Frontend",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "message": "Technologies retrieved successfully",
  "status": "success"
}
```

---

### **5. Get Technology by ID**

**Method:** `GET`  
**URL:** `{{base_url}}/technologies/{id}`  
**Authentication:** Not required  
**Description:** Get a specific technology by its ID

#### **Path Parameters:**

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `id`      | string | Yes      | Technology UUID |

#### **Example Request:**

```bash
GET {{base_url}}/technologies/123e4567-e89b-12d3-a456-426614174000
```

#### **Response Example:**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend",
    "icon_url": "https://example.com/react-icon.png",
    "icon_filename": "react-icon.png",
    "icon_size": 1024,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Technology retrieved successfully",
  "status": "success"
}
```

---

### **6. Create Technology**

**Method:** `POST`  
**URL:** `{{base_url}}/technologies`  
**Authentication:** Required (JWT token)  
**Description:** Create a new technology with optional icon (Admin only)

#### **Request Body:**

**Content-Type:** `multipart/form-data`

| Field         | Type    | Required | Description                                      |
| ------------- | ------- | -------- | ------------------------------------------------ |
| `name`        | string  | Yes      | Technology name                                  |
| `description` | string  | No       | Technology description                           |
| `category`    | string  | Yes      | Technology category (enum)                       |
| `is_active`   | boolean | No       | Whether the technology is active (default: true) |
| `icon`        | file    | No       | Technology icon file (image)                     |

#### **Category Enum Values:**

- `Frontend` - Frontend technologies
- `Backend` - Backend technologies
- `Database` - Database technologies
- `DevOps` - DevOps tools and practices
- `Mobile` - Mobile development
- `Desktop` - Desktop applications
- `Cloud` - Cloud platforms and services
- `AI/ML` - Artificial Intelligence and Machine Learning
- `Other` - Other technologies

#### **Supported File Types (for icon):**

- JPEG, JPG, PNG, WebP, GIF, BMP, TIFF
- SVG, AVIF, HEIC, HEIF, ICO
- **Max Size:** 2MB

#### **Example Request:**

```bash
POST {{base_url}}/technologies
Content-Type: multipart/form-data
Authorization: Bearer {{auth_token}}

Form Data:
- name: "Vue.js"
- description: "A progressive JavaScript framework"
- category: "Frontend"
- is_active: true
- icon: [Select File] (e.g., vue-icon.png)
```

#### **Response Example:**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Vue.js",
    "description": "A progressive JavaScript framework",
    "category": "Frontend",
    "icon_url": "https://your-supabase-url.supabase.co/storage/v1/object/public/technology-icons/tech-123e4567-e89b-12d3-a456-426614174000/1703123456789-abc123.png",
    "icon_filename": "1703123456789-abc123.png",
    "icon_size": 1024,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Technology created successfully",
  "status": "success"
}
```

---

### **7. Update Technology**

**Method:** `PUT`  
**URL:** `{{base_url}}/technologies/{id}`  
**Authentication:** Required (JWT token)  
**Description:** Update a technology (Admin only)

#### **Path Parameters:**

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `id`      | string | Yes      | Technology UUID |

#### **Request Body:**

```json
{
  "name": "React 18",
  "description": "A JavaScript library for building user interfaces - Updated",
  "category": "Frontend",
  "is_active": true
}
```

#### **Request Body Schema:**

| Field         | Type    | Required | Description                      |
| ------------- | ------- | -------- | -------------------------------- |
| `name`        | string  | No       | Technology name                  |
| `description` | string  | No       | Technology description           |
| `category`    | string  | No       | Technology category              |
| `is_active`   | boolean | No       | Whether the technology is active |

#### **Example Request:**

```bash
PUT {{base_url}}/technologies/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "name": "React 18",
  "description": "A JavaScript library for building user interfaces - Updated",
  "is_active": false
}
```

#### **Response Example:**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React 18",
    "description": "A JavaScript library for building user interfaces - Updated",
    "category": "Frontend",
    "is_active": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  },
  "message": "Technology updated successfully",
  "status": "success"
}
```

---

### **8. Upload Technology Icon**

**Method:** `POST`  
**URL:** `{{base_url}}/technologies/{id}/icon`  
**Authentication:** Required (JWT token)  
**Description:** Upload an icon for a technology (Admin only)

#### **Path Parameters:**

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `id`      | string | Yes      | Technology UUID |

#### **Request Body:**

**Content-Type:** `multipart/form-data`

| Field  | Type | Required | Description                  |
| ------ | ---- | -------- | ---------------------------- |
| `icon` | file | Yes      | Technology icon file (image) |

#### **Supported File Types:**

- JPEG, JPG, PNG, WebP, GIF, BMP, TIFF
- SVG, AVIF, HEIC, HEIF, ICO
- **Max Size:** 2MB

#### **Example Request:**

```bash
POST {{base_url}}/technologies/123e4567-e89b-12d3-a456-426614174000/icon
Content-Type: multipart/form-data
Authorization: Bearer {{auth_token}}

Form Data:
- icon: [Select File] (e.g., react-icon.png)
```

#### **Response Example:**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend",
    "icon_url": "https://your-supabase-url.supabase.co/storage/v1/object/public/technology-icons/tech-123e4567-e89b-12d3-a456-426614174000/1703123456789-abc123.png",
    "icon_filename": "1703123456789-abc123.png",
    "icon_size": 1024,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  },
  "message": "Icon uploaded successfully",
  "status": "success"
}
```

---

### **9. Delete Technology**

**Method:** `DELETE`  
**URL:** `{{base_url}}/technologies/{id}`  
**Authentication:** Required (JWT token)  
**Description:** Delete a technology (Admin only)

#### **Path Parameters:**

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `id`      | string | Yes      | Technology UUID |

#### **Example Request:**

```bash
DELETE {{base_url}}/technologies/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {{auth_token}}
```

#### **Response Example:**

```json
{
  "data": null,
  "message": "Technology deleted successfully",
  "status": "success"
}
```

---

## 📊 **Status Codes**

| Code  | Description                                |
| ----- | ------------------------------------------ |
| `200` | OK - Request successful                    |
| `201` | Created - Resource created successfully    |
| `204` | No Content - Resource deleted successfully |
| `400` | Bad Request - Invalid input data           |
| `401` | Unauthorized - Authentication required     |
| `404` | Not Found - Resource not found             |
| `500` | Internal Server Error - Server error       |

## 🧪 **Postman Collection Setup**

### **1. Create Collection**

1. Open Postman
2. Click "New" → "Collection"
3. Name it "Technologies API"
4. Add description: "Complete API collection for Technologies management"

### **2. Create Environment**

1. Click "Environments" → "Create Environment"
2. Name it "Technologies API - Local"
3. Add variables:
   - `base_url`: `http://localhost:3000/api/v1`
   - `auth_token`: `your_jwt_token_here`

### **3. Add Pre-request Scripts**

For the collection, add this pre-request script to automatically set headers:

```javascript
pm.request.headers.add({
  key: 'Content-Type',
  value: 'application/json',
});

if (pm.environment.get('auth_token')) {
  pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('auth_token'),
  });
}
```

### **4. Add Tests**

For each request, add these tests:

```javascript
// Test response status
pm.test('Status code is successful', function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

// Test response structure
pm.test('Response has required fields', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('data');
  pm.expect(jsonData).to.have.property('message');
  pm.expect(jsonData).to.have.property('status');
});

// Test response time
pm.test('Response time is less than 2000ms', function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

## 🔍 **Common Use Cases**

### **1. Get All Frontend Technologies**

```bash
GET {{base_url}}/technologies?category=Frontend&is_active=true
```

### **2. Search for JavaScript Technologies**

```bash
GET {{base_url}}/technologies/search?q=javascript
```

### **3. Get Technologies with Pagination**

```bash
GET {{base_url}}/technologies?page=2&limit=5&sort_by=name&sort_order=asc
```

### **4. Create a New Technology**

```bash
POST {{base_url}}/technologies
{
  "name": "Next.js",
  "description": "The React Framework for Production",
  "category": "Frontend",
  "is_active": true
}
```

### **5. Update Technology Status**

```bash
PUT {{base_url}}/technologies/{id}
{
  "is_active": false
}
```

## 🚨 **Error Handling**

### **Common Error Responses:**

#### **400 Bad Request**

```json
{
  "statusCode": 400,
  "message": "Failed to create technology: duplicate key value violates unique constraint",
  "error": "Bad Request"
}
```

#### **401 Unauthorized**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### **404 Not Found**

```json
{
  "statusCode": 404,
  "message": "Technology with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

## 📝 **Notes**

1. **Authentication**: Protected endpoints require a valid JWT token
2. **Pagination**: Default page size is 10, maximum is 100
3. **Search**: Case-insensitive search across name and description
4. **Categories**: Common categories include "Frontend", "Backend", "Database", "DevOps", "Mobile"
5. **Icons**: Icon upload functionality is available but not documented in this collection

## 🔗 **Related Documentation**

- [API Documentation](http://localhost:3000/api/docs) - Swagger UI
- [Authentication API](AUTH_API_DOCUMENTATION.md) - Authentication endpoints
- [Projects API](PROJECTS_API_DOCUMENTATION.md) - Projects management

---

**Last Updated:** 2024-01-01  
**API Version:** 1.0.0  
**Contact:** API Support Team
