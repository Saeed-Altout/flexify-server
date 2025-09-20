# 👥 User Management API Endpoints Documentation

## 📋 Overview

This document provides comprehensive Postman documentation for all User Management API endpoints in the Flexify backend service. The User Management service allows administrators to manage user accounts, view statistics, control user access, and perform administrative actions.

## 🔐 Authentication

All user management endpoints require JWT authentication with **ADMIN** role. Include the token in the Authorization header:

```
Authorization: Bearer <your_admin_jwt_token>
```

**Note**: These endpoints are restricted to admin users only for security reasons.

## 🗂️ Base URL

```
{{base_url}} = http://localhost:3000/api/v1
```

---

## 📝 API Endpoints

### 1. 🔒 **Get All Users (Admin Only)**

**Endpoint**: `GET /api/v1/auth/users`

**Authentication**: Required (Admin)

**Description**: Get a paginated list of all users with optional filtering and sorting.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:

- `role` (string, optional): Filter by user role (`USER`, `ADMIN`)
- `is_active` (boolean, optional): Filter by active status
- `email_verified` (boolean, optional): Filter by email verification status
- `search` (string, optional): Search term for name or email
- `page` (number, optional): Page number (default: 1, minimum: 1)
- `limit` (number, optional): Items per page (default: 10, minimum: 1, maximum: 100)
- `sort_by` (string, optional): Sort by field (`name`, `email`, `role`, `is_active`, `created_at`, `last_login_at`)
- `sort_order` (string, optional): Sort order (`asc`, `desc`)

**Example Requests**:

```
GET /api/v1/auth/users
GET /api/v1/auth/users?role=USER&is_active=true&page=1&limit=5
GET /api/v1/auth/users?search=john&sort_by=created_at&sort_order=desc
```

**Response (200 OK)**:

```json
{
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "name": "John Doe",
        "bio": "Passionate developer with 5+ years of experience",
        "avatar_url": "https://example.com/avatar.jpg",
        "cv_file_url": "https://example.com/cv.pdf",
        "cv_file_name": "resume.pdf",
        "cv_file_size": 1024000,
        "cv_uploaded_at": "2024-12-20T10:30:00.000Z",
        "role": "USER",
        "is_active": true,
        "email_verified": true,
        "last_login_at": "2024-12-20T10:30:00.000Z",
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  },
  "message": "Users retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required

---

### 2. 🔒 **Get User Statistics (Admin Only)**

**Endpoint**: `GET /api/v1/auth/users/stats`

**Authentication**: Required (Admin)

**Description**: Get comprehensive user statistics and analytics.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK)**:

```json
{
  "data": {
    "total": 100,
    "active": 80,
    "inactive": 20,
    "admins": 5,
    "users": 95,
    "verified": 90,
    "unverified": 10,
    "today": 5,
    "this_week": 20,
    "this_month": 80
  },
  "message": "User statistics retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required

---

### 3. 🔒 **Get User by ID (Admin Only)**

**Endpoint**: `GET /api/v1/auth/users/:id`

**Authentication**: Required (Admin)

**Description**: Get detailed information about a specific user.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `id` (string, required): User UUID

**Example Request**:

```
GET /api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "bio": "Passionate developer with 5+ years of experience",
    "avatar_url": "https://example.com/avatar.jpg",
    "cv_file_url": "https://example.com/cv.pdf",
    "cv_file_name": "resume.pdf",
    "cv_file_size": 1024000,
    "cv_uploaded_at": "2024-12-20T10:30:00.000Z",
    "role": "USER",
    "is_active": true,
    "email_verified": true,
    "last_login_at": "2024-12-20T10:30:00.000Z",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "message": "User retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required
- `404 Not Found`: User not found

---

### 4. 🔒 **Get User Sessions (Admin Only)**

**Endpoint**: `GET /api/v1/auth/users/:id/sessions`

**Authentication**: Required (Admin)

**Description**: Get all active sessions for a specific user.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `id` (string, required): User UUID

**Example Request**:

```
GET /api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000/sessions
```

**Response (200 OK)**:

```json
{
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "is_active": true,
      "email_verified": true,
      "last_login_at": "2024-12-20T10:30:00.000Z",
      "created_at": "2024-12-20T10:30:00.000Z",
      "updated_at": "2024-12-20T10:30:00.000Z"
    },
    "sessions": [
      {
        "id": "session-123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "expires_at": "2024-12-20T10:30:00.000Z",
        "is_active": true,
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      }
    ]
  },
  "message": "User sessions retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required
- `404 Not Found`: User not found

---

### 5. 🔒 **Update User Status (Admin Only)**

**Endpoint**: `PUT /api/v1/auth/users/:id/status`

**Authentication**: Required (Admin)

**Description**: Activate or deactivate a user account.

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `id` (string, required): User UUID

**Request Body**:

```json
{
  "is_active": false
}
```

**Request Body Schema**:

- `is_active` (boolean, required): User active status

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "bio": "Passionate developer with 5+ years of experience",
    "avatar_url": "https://example.com/avatar.jpg",
    "cv_file_url": "https://example.com/cv.pdf",
    "cv_file_name": "resume.pdf",
    "cv_file_size": 1024000,
    "cv_uploaded_at": "2024-12-20T10:30:00.000Z",
    "role": "USER",
    "is_active": false,
    "email_verified": true,
    "last_login_at": "2024-12-20T10:30:00.000Z",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:35:00.000Z"
  },
  "message": "User deactivated successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required
- `404 Not Found`: User not found

---

### 6. 🔒 **Update User Role (Admin Only)**

**Endpoint**: `PUT /api/v1/auth/users/:id/role`

**Authentication**: Required (Admin)

**Description**: Change user role between USER and ADMIN.

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `id` (string, required): User UUID

**Request Body**:

```json
{
  "role": "ADMIN"
}
```

**Request Body Schema**:

- `role` (string, required): User role (`USER`, `ADMIN`)

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "bio": "Passionate developer with 5+ years of experience",
    "avatar_url": "https://example.com/avatar.jpg",
    "cv_file_url": "https://example.com/cv.pdf",
    "cv_file_name": "resume.pdf",
    "cv_file_size": 1024000,
    "cv_uploaded_at": "2024-12-20T10:30:00.000Z",
    "role": "ADMIN",
    "is_active": true,
    "email_verified": true,
    "last_login_at": "2024-12-20T10:30:00.000Z",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:35:00.000Z"
  },
  "message": "User role updated to ADMIN successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required
- `404 Not Found`: User not found

---

### 7. 🔒 **Force Logout User (Admin Only)**

**Endpoint**: `POST /api/v1/auth/users/:id/logout`

**Authentication**: Required (Admin)

**Description**: Force logout a user by invalidating all their active sessions.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `id` (string, required): User UUID

**Example Request**:

```
POST /api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000/logout
```

**Response (200 OK)**:

```json
{
  "data": null,
  "message": "User logged out successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required
- `404 Not Found`: User not found

---

### 8. 🔒 **Delete User (Admin Only)**

**Endpoint**: `DELETE /api/v1/auth/users/:id`

**Authentication**: Required (Admin)

**Description**: Permanently delete a user account and all associated data.

**Request Headers**:

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:

- `id` (string, required): User UUID

**Example Request**:

```
DELETE /api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:

```json
{
  "data": null,
  "message": "User deleted successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Admin access required
- `404 Not Found`: User not found

---

## 📊 Data Models

### User Entity

```typescript
interface User {
  id: string; // UUID primary key
  email: string; // User email
  name: string; // User full name
  bio?: string; // User biography
  password_hash: string; // Hashed password (not returned in responses)
  avatar_url?: string; // Avatar image URL
  cv_file_url?: string; // CV file URL
  cv_file_name?: string; // CV file name
  cv_file_size?: number; // CV file size in bytes
  cv_uploaded_at?: string; // CV upload timestamp
  theme?: string; // User theme preference
  timezone?: string; // User timezone
  time_format?: string; // Time format preference
  language?: string; // Language preference
  date_format?: string; // Date format preference
  role: UserRole; // User role (USER, ADMIN)
  is_active: boolean; // Account active status
  email_verified: boolean; // Email verification status
  last_login_at?: string; // Last login timestamp
  created_at: string; // Creation timestamp
  updated_at: string; // Last update timestamp
}
```

### User Role Enum

```typescript
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
```

### User Session Entity

```typescript
interface UserSession {
  id: string; // Session UUID
  user_id: string; // User ID
  expires_at: string; // Session expiration time
  is_active: boolean; // Session active status
  ip_address?: string; // IP address
  user_agent?: string; // User agent
  created_at: string; // Session creation time
  updated_at: string; // Last update time
}
```

### User Statistics

```typescript
interface UserStats {
  total: number; // Total users
  active: number; // Active users
  inactive: number; // Inactive users
  admins: number; // Admin users
  users: number; // Regular users
  verified: number; // Email verified users
  unverified: number; // Email unverified users
  today: number; // New users today
  this_week: number; // New users this week
  this_month: number; // New users this month
}
```

---

## 🚨 Error Codes

| Status Code | Error Type            | Description                             |
| ----------- | --------------------- | --------------------------------------- |
| `200`       | OK                    | Request successful                      |
| `400`       | Bad Request           | Invalid input data or validation errors |
| `401`       | Unauthorized          | Missing or invalid JWT token            |
| `403`       | Forbidden             | Admin access required                   |
| `404`       | Not Found             | User not found                          |
| `500`       | Internal Server Error | Server-side error                       |

---

## 🧪 Testing Examples

### 1. Get All Users

```bash
curl -X GET "http://localhost:3000/api/v1/auth/users?role=USER&is_active=true&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Accept: application/json"
```

### 2. Get User Statistics

```bash
curl -X GET "http://localhost:3000/api/v1/auth/users/stats" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Accept: application/json"
```

### 3. Get User by ID

```bash
curl -X GET "http://localhost:3000/api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Accept: application/json"
```

### 4. Get User Sessions

```bash
curl -X GET "http://localhost:3000/api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000/sessions" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Accept: application/json"
```

### 5. Update User Status

```bash
curl -X PUT "http://localhost:3000/api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "is_active": false
  }'
```

### 6. Update User Role

```bash
curl -X PUT "http://localhost:3000/api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000/role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "role": "ADMIN"
  }'
```

### 7. Force Logout User

```bash
curl -X POST "http://localhost:3000/api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000/logout" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 8. Delete User

```bash
curl -X DELETE "http://localhost:3000/api/v1/auth/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## 🔧 Configuration

### Pagination Defaults

- **Default page size**: 10 items
- **Maximum page size**: 100 items
- **Default page**: 1

### Search Configuration

- **Search fields**: name, email
- **Case sensitivity**: Case-insensitive
- **Search type**: Partial match (ILIKE)

### User Management Features

- **Account Status Control**: Activate/deactivate user accounts
- **Role Management**: Change user roles between USER and ADMIN
- **Session Management**: View and force logout user sessions
- **Comprehensive Statistics**: Detailed analytics and metrics
- **Advanced Filtering**: Filter by role, status, verification, and search terms
- **Sorting Options**: Sort by various fields in ascending or descending order

---

## 🛡️ Security Considerations

### Admin-Only Access

- All user management endpoints require admin authentication
- JWT tokens are validated for admin role
- Unauthorized access attempts are logged

### Data Protection

- Password hashes are never returned in responses
- Sensitive user information is properly filtered
- Session data includes IP addresses and user agents for security monitoring

### Audit Trail

- All admin actions are logged with timestamps
- User status changes are tracked
- Session management actions are recorded

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:3000/api/docs` (when running)
- **Health Check**: `http://localhost:3000/api/v1/health`
- **Database Schema**: See `database/` folder for table structures
- **Authentication Endpoints**: See `AUTH_ENDPOINTS_DOCUMENTATION.md`

---

## 🎯 Use Cases

### 1. User Administration

- View all registered users with filtering and pagination
- Search for specific users by name or email
- Get detailed user information and statistics

### 2. Account Management

- Activate or deactivate user accounts
- Change user roles (promote to admin or demote to user)
- Monitor user activity through session management

### 3. Security Management

- Force logout users from all devices
- Monitor active sessions and login patterns
- Track user verification status

### 4. Analytics and Reporting

- Get comprehensive user statistics
- Monitor user growth and activity
- Track verification rates and user engagement

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Maintainer**: Flexify Development Team
