# 🚀 Technologies Service API - Postman Documentation

## 📋 Overview

This document provides comprehensive Postman examples for the Technologies Service API endpoints. The service manages predefined technologies that can be used in projects, ensuring data consistency and validation.

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Note**: Public endpoints (GET requests) don't require authentication.

## 🗂️ Postman Collection Structure

### Base URL

```
{{base_url}} = http://localhost:3000/api
```

### Environment Variables

Create a Postman environment with these variables:

- `base_url`: `http://localhost:3000/api`
- `jwt_token`: Your admin JWT token
- `technology_id`: ID of a technology (for update/delete operations)

---

## 📝 API Endpoints

### 1. 🔒 **Create Technology (Admin Only)**

**Endpoint**: `POST {{base_url}}/technologies`

**Headers**:

```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Request Body**:

```json
{
  "label": "Next.js",
  "value": "nextjs"
}
```

**Response (201 Created)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "label": "Next.js",
    "value": "nextjs",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "status": "success",
  "message": "Technology created successfully"
}
```

**Error Response (409 Conflict)**:

```json
{
  "statusCode": 409,
  "message": "Technology with value 'nextjs' already exists",
  "error": "Conflict"
}
```

---

### 2. 🔒 **Bulk Create Technologies (Admin Only)**

**Endpoint**: `POST {{base_url}}/technologies/bulk`

**Headers**:

```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Request Body**:

```json
{
  "technologies": [
    {
      "label": "Svelte",
      "value": "svelte"
    },
    {
      "label": "Nuxt.js",
      "value": "nuxt"
    },
    {
      "label": "Gatsby",
      "value": "gatsby"
    }
  ]
}
```

**Response (201 Created)**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "label": "Svelte",
      "value": "svelte",
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "label": "Nuxt.js",
      "value": "nuxt",
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174003",
      "label": "Gatsby",
      "value": "gatsby",
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    }
  ],
  "status": "success",
  "message": "Successfully created 3 technologies"
}
```

---

### 3. 🔒 **Update Technology (Admin Only)**

**Endpoint**: `PUT {{base_url}}/technologies/{{technology_id}}`

**Headers**:

```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Request Body**:

```json
{
  "label": "Next.js v14",
  "value": "nextjs"
}
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "label": "Next.js v14",
    "value": "nextjs",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:35:00.000Z"
  },
  "status": "success",
  "message": "Technology updated successfully"
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

### 4. 🔒 **Delete Technology (Admin Only)**

**Endpoint**: `DELETE {{base_url}}/technologies/{{technology_id}}`

**Headers**:

```
Authorization: Bearer {{jwt_token}}
```

**Response (204 No Content)**: No response body

**Error Response (400 Bad Request)**:

```json
{
  "statusCode": 400,
  "message": "Cannot delete technology 'React.js' as it is used in projects: My Portfolio, E-commerce App",
  "error": "Bad Request"
}
```

---

### 5. 🌐 **List Technologies (Public)**

**Endpoint**: `GET {{base_url}}/technologies`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Page size (default: 10, max: 100)
- `q` (optional): Search query for label or value

**Example Requests**:

**Basic List**:

```
GET {{base_url}}/technologies
```

**With Pagination**:

```
GET {{base_url}}/technologies?page=2&limit=5
```

**With Search**:

```
GET {{base_url}}/technologies?q=react
```

**Response (200 OK)**:

```json
{
  "data": {
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "label": "React.js",
        "value": "react",
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "label": "Vue.js",
        "value": "vue",
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10,
    "next": true,
    "prev": false
  },
  "status": "success",
  "message": "Technologies retrieved successfully"
}
```

---

### 6. 🌐 **Get All Technologies (Public)**

**Endpoint**: `GET {{base_url}}/technologies/all`

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "label": "React.js",
      "value": "react",
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "label": "Vue.js",
      "value": "vue",
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    }
  ],
  "status": "success",
  "message": "All technologies retrieved successfully"
}
```

---

### 7. 🌐 **Get Technologies for Projects (Public)**

**Endpoint**: `GET {{base_url}}/technologies/for-projects`

**Response (200 OK)**:

```json
{
  "data": [
    "react",
    "vue",
    "angular",
    "nodejs",
    "python",
    "django",
    "typescript",
    "javascript"
  ],
  "status": "success",
  "message": "Technology values retrieved successfully"
}
```

---

### 8. 🌐 **Get Technology by ID (Public)**

**Endpoint**: `GET {{base_url}}/technologies/{{technology_id}}`

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "label": "React.js",
    "value": "react",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "status": "success",
  "message": "Technology retrieved successfully"
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

### 9. 🌐 **Get Technology by Value (Public)**

**Endpoint**: `GET {{base_url}}/technologies/by-value/{{technology_value}}`

**Example**:

```
GET {{base_url}}/technologies/by-value/react
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "label": "React.js",
    "value": "react",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "status": "success",
  "message": "Technology retrieved successfully"
}
```

---

## 🧪 **Testing Scenarios**

### **1. Admin Workflow Test**

1. **Login as Admin** - Get JWT token
2. **Create Technology** - Test single creation
3. **Bulk Create** - Test multiple technologies
4. **Update Technology** - Test modification
5. **Delete Technology** - Test removal (if not used)

### **2. Public Access Test**

1. **List Technologies** - Test pagination and search
2. **Get All Technologies** - Test complete list
3. **Get for Projects** - Test project form data
4. **Get by ID/Value** - Test individual retrieval

### **3. Error Handling Test**

1. **Duplicate Creation** - Test uniqueness validation
2. **Invalid Updates** - Test constraint violations
3. **Unauthorized Access** - Test admin-only endpoints
4. **Delete Used Technology** - Test deletion constraints

---

## 📊 **Sample Data for Testing**

### **Frontend Technologies**

```json
{
  "technologies": [
    { "label": "React.js", "value": "react" },
    { "label": "Vue.js", "value": "vue" },
    { "label": "Angular", "value": "angular" },
    { "label": "Next.js", "value": "nextjs" },
    { "label": "Nuxt.js", "value": "nuxt" },
    { "label": "Svelte", "value": "svelte" },
    { "label": "Gatsby", "value": "gatsby" }
  ]
}
```

### **Backend Technologies**

```json
{
  "technologies": [
    { "label": "Node.js", "value": "nodejs" },
    { "label": "Python", "value": "python" },
    { "label": "Django", "value": "django" },
    { "label": "FastAPI", "value": "fastapi" },
    { "label": "Express.js", "value": "express" },
    { "label": "Flask", "value": "flask" }
  ]
}
```

### **Database Technologies**

```json
{
  "technologies": [
    { "label": "PostgreSQL", "value": "postgresql" },
    { "label": "MongoDB", "value": "mongodb" },
    { "label": "Redis", "value": "redis" },
    { "label": "MySQL", "value": "mysql" },
    { "label": "SQLite", "value": "sqlite" }
  ]
}
```

---

## 🔧 **Postman Collection Setup**

### **1. Create Collection**

- Name: `Technologies Service API`
- Description: `API endpoints for managing technologies in Flexify backend`

### **2. Create Folders**

- **Admin Operations** - POST, PUT, DELETE endpoints
- **Public Operations** - GET endpoints
- **Testing** - Test scenarios and examples

### **3. Set Environment Variables**

```json
{
  "base_url": "http://localhost:3000/api",
  "jwt_token": "",
  "technology_id": ""
}
```

### **4. Pre-request Scripts**

**For Admin Endpoints**:

```javascript
// Set JWT token if not exists
if (!pm.environment.get('jwt_token')) {
  pm.environment.set('jwt_token', 'your_jwt_token_here');
}
```

**For Update/Delete Operations**:

```javascript
// Set technology_id from previous response
if (pm.response.code === 201 || pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set('technology_id', response.data.id);
}
```

---

## 🚨 **Common Error Codes**

| Status Code | Error Type            | Description                        |
| ----------- | --------------------- | ---------------------------------- |
| `400`       | Bad Request           | Invalid data, validation errors    |
| `401`       | Unauthorized          | Missing or invalid JWT token       |
| `403`       | Forbidden             | Admin privileges required          |
| `404`       | Not Found             | Technology not found               |
| `409`       | Conflict              | Duplicate technology (label/value) |
| `500`       | Internal Server Error | Server-side error                  |

---

## 📱 **Mobile/App Testing**

### **Headers for Mobile Apps**

```
User-Agent: FlexifyApp/1.0.0
Accept: application/json
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

### **Rate Limiting Considerations**

- Public endpoints: 100 requests/minute
- Admin endpoints: 50 requests/minute
- Bulk operations: 10 requests/minute

---

## 🔍 **Debugging Tips**

### **1. Check JWT Token**

```bash
# Decode JWT token to verify claims
echo "your_jwt_token" | base64 -d
```

### **2. Verify Database State**

```sql
-- Check technologies table
SELECT * FROM public.technologies ORDER BY created_at DESC LIMIT 5;

-- Check for duplicates
SELECT label, COUNT(*) FROM public.technologies GROUP BY label HAVING COUNT(*) > 1;
```

### **3. Monitor Logs**

```bash
# Check application logs
tail -f logs/application.log | grep "technologies"
```

---

## 📚 **Additional Resources**

- **Swagger Documentation**: `{{base_url}}/api`
- **Health Check**: `{{base_url}}/health`
- **API Status**: `{{base_url}}/status`

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Maintainer**: Flexify Development Team
