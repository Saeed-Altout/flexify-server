# 📧 Messages API Endpoints Documentation

## 📋 Overview

This document provides comprehensive Postman documentation for all Messages API endpoints in the Flexify backend service. The Messages service handles contact form submissions, message management, and communication tracking.

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Note**: The send message endpoint is public and doesn't require authentication.

## 🗂️ Base URL

```
{{base_url}} = http://localhost:3000/api/v1
```

---

## 📝 API Endpoints

### 1. 🌐 **Send Message (Public)**

**Endpoint**: `POST /api/v1/messages`

**Authentication**: Not required

**Description**: Send a new message through the contact form (public endpoint).

**Request Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a potential project with you."
}
```

**Request Body Schema**:

- `name` (string, required): Sender name
- `email` (string, required): Sender email (must be valid email format)
- `subject` (string, required): Message subject
- `message` (string, required): Message content

**Response (201 Created)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a potential project with you.",
    "status": "unread",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "message": "Message sent successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data or validation errors

---

### 2. 🔒 **Get Messages (Admin Only)**

**Endpoint**: `GET /api/v1/messages`

**Authentication**: Required (Admin)

**Description**: Get a paginated list of messages with optional filtering.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `status` (string, optional): Filter by status (`unread`, `read`, `replied`, `archived`)
- `user_id` (string, optional): Filter by user ID
- `search` (string, optional): Search term for name, email, or subject
- `page` (number, optional): Page number (default: 1, minimum: 1)
- `limit` (number, optional): Items per page (default: 10, minimum: 1, maximum: 100)
- `sort_by` (string, optional): Sort by field (`name`, `email`, `status`, `created_at`)
- `sort_order` (string, optional): Sort order (`asc`, `desc`)

**Example Requests**:

```
GET /api/v1/messages
GET /api/v1/messages?status=unread&page=1&limit=5
GET /api/v1/messages?search=project&sort_by=created_at&sort_order=desc
```

**Response (200 OK)**:

```json
{
  "data": {
    "messages": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Project Inquiry",
        "message": "I would like to discuss a potential project with you.",
        "status": "unread",
        "user_id": null,
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  },
  "message": "Messages retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token

---

### 3. 🔒 **Get Message Statistics (Admin Only)**

**Endpoint**: `GET /api/v1/messages/stats`

**Authentication**: Required (Admin)

**Description**: Get message statistics and analytics.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:

```json
{
  "data": {
    "total": 100,
    "unread": 25,
    "read": 50,
    "replied": 25,
    "today": 5,
    "this_week": 20,
    "this_month": 80
  },
  "message": "Message statistics retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token

---

### 4. 🔒 **Search Messages (Admin Only)**

**Endpoint**: `GET /api/v1/messages/search`

**Authentication**: Required (Admin)

**Description**: Search messages by name, email, or subject.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `q` (string, required): Search term
- `status` (string, optional): Filter by status
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `sort_by` (string, optional): Sort by field
- `sort_order` (string, optional): Sort order

**Example Request**:

```
GET /api/v1/messages/search?q=project&status=unread
```

**Response (200 OK)**:

```json
{
  "data": {
    "messages": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Project Inquiry",
        "message": "I would like to discuss a potential project with you.",
        "status": "unread",
        "user_id": null,
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  },
  "message": "Search results retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token

---

### 5. 🔒 **Get Messages by Status (Admin Only)**

**Endpoint**: `GET /api/v1/messages/status/:status`

**Authentication**: Required (Admin)

**Description**: Get messages filtered by status.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `status` (string, required): Message status (`unread`, `read`, `replied`, `archived`)

**Query Parameters**:

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `sort_by` (string, optional): Sort by field
- `sort_order` (string, optional): Sort order

**Example Request**:

```
GET /api/v1/messages/status/unread?page=1&limit=5
```

**Response (200 OK)**:

```json
{
  "data": {
    "messages": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Project Inquiry",
        "message": "I would like to discuss a potential project with you.",
        "status": "unread",
        "user_id": null,
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2024-12-20T10:30:00.000Z",
        "updated_at": "2024-12-20T10:30:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3
  },
  "message": "Messages retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token

---

### 6. 🔒 **Get Message by ID (Admin Only)**

**Endpoint**: `GET /api/v1/messages/:id`

**Authentication**: Required (Admin)

**Description**: Get a specific message by its ID.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Message UUID

**Example Request**:

```
GET /api/v1/messages/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a potential project with you.",
    "status": "unread",
    "user_id": null,
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:30:00.000Z"
  },
  "message": "Message retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Message not found

---

### 7. 🔒 **Get Message with Replies (Admin Only)**

**Endpoint**: `GET /api/v1/messages/:id/with-replies`

**Authentication**: Required (Admin)

**Description**: Get a message with all its replies.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Message UUID

**Example Request**:

```
GET /api/v1/messages/123e4567-e89b-12d3-a456-426614174000/with-replies
```

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a potential project with you.",
    "status": "replied",
    "user_id": "admin-user-id",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:35:00.000Z",
    "replies": [
      {
        "id": "reply-123e4567-e89b-12d3-a456-426614174000",
        "message_id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "admin-user-id",
        "reply": "Thank you for your message. I will get back to you soon.",
        "created_at": "2024-12-20T10:35:00.000Z",
        "updated_at": "2024-12-20T10:35:00.000Z"
      }
    ]
  },
  "message": "Message with replies retrieved successfully",
  "status": "success"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Message not found

---

### 8. 🔒 **Update Message Status (Admin Only)**

**Endpoint**: `PUT /api/v1/messages/:id/status`

**Authentication**: Required (Admin)

**Description**: Update message status.

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Message UUID

**Request Body**:

```json
{
  "status": "read"
}
```

**Request Body Schema**:

- `status` (string, required): Message status (`unread`, `read`, `replied`, `archived`)

**Response (200 OK)**:

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a potential project with you.",
    "status": "read",
    "user_id": null,
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-12-20T10:30:00.000Z",
    "updated_at": "2024-12-20T10:35:00.000Z"
  },
  "message": "Message status updated successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Message not found

---

### 9. 🔒 **Reply to Message (Admin Only)**

**Endpoint**: `POST /api/v1/messages/:id/reply`

**Authentication**: Required (Admin)

**Description**: Send a reply to a message.

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Message UUID

**Request Body**:

```json
{
  "reply": "Thank you for your message. I will get back to you soon."
}
```

**Request Body Schema**:

- `reply` (string, required): Reply content

**Response (201 Created)**:

```json
{
  "data": {
    "id": "reply-123e4567-e89b-12d3-a456-426614174000",
    "message_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "admin-user-id",
    "reply": "Thank you for your message. I will get back to you soon.",
    "created_at": "2024-12-20T10:35:00.000Z",
    "updated_at": "2024-12-20T10:35:00.000Z"
  },
  "message": "Reply sent successfully",
  "status": "success"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Message not found

---

### 10. 🔒 **Delete Message (Admin Only)**

**Endpoint**: `DELETE /api/v1/messages/:id`

**Authentication**: Required (Admin)

**Description**: Delete a message.

**Request Headers**:

```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:

- `id` (string, required): Message UUID

**Example Request**:

```
DELETE /api/v1/messages/123e4567-e89b-12d3-a456-426614174000
```

**Response (204 No Content)**:
No response body

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Message not found

---

## 📊 Data Models

### Message Entity

```typescript
interface Message {
  id: string; // UUID primary key
  name: string; // Sender name
  email: string; // Sender email
  subject: string; // Message subject
  message: string; // Message content
  status: MessageStatus; // Message status
  user_id?: string; // User ID who replied
  ip_address?: string; // IP address
  user_agent?: string; // User agent
  created_at: string; // Creation timestamp
  updated_at: string; // Last update timestamp
}
```

### Message Status Enum

```typescript
enum MessageStatus {
  Unread = 'unread',
  Read = 'read',
  Replied = 'replied',
  Archived = 'archived',
}
```

### Message Reply Entity

```typescript
interface MessageReply {
  id: string; // Reply UUID
  message_id: string; // Parent message ID
  user_id: string; // User ID who replied
  reply: string; // Reply content
  created_at: string; // Creation timestamp
  updated_at: string; // Last update timestamp
}
```

### Message Statistics

```typescript
interface MessageStats {
  total: number; // Total messages
  unread: number; // Unread messages
  read: number; // Read messages
  replied: number; // Replied messages
  today: number; // Messages today
  this_week: number; // Messages this week
  this_month: number; // Messages this month
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

### 1. Send Message (Public)

```bash
curl -X POST "http://localhost:3000/api/v1/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Partnership Inquiry",
    "message": "I am interested in discussing a potential partnership."
  }'
```

### 2. Get Messages (Admin)

```bash
curl -X GET "http://localhost:3000/api/v1/messages?status=unread&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

### 3. Get Message Statistics

```bash
curl -X GET "http://localhost:3000/api/v1/messages/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

### 4. Search Messages

```bash
curl -X GET "http://localhost:3000/api/v1/messages/search?q=project" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

### 5. Update Message Status

```bash
curl -X PUT "http://localhost:3000/api/v1/messages/123e4567-e89b-12d3-a456-426614174000/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "read"
  }'
```

### 6. Reply to Message

```bash
curl -X POST "http://localhost:3000/api/v1/messages/123e4567-e89b-12d3-a456-426614174000/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reply": "Thank you for your interest. I will contact you soon."
  }'
```

### 7. Delete Message

```bash
curl -X DELETE "http://localhost:3000/api/v1/messages/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Configuration

### Pagination Defaults

- **Default page size**: 10 items
- **Maximum page size**: 100 items
- **Default page**: 1

### Search Configuration

- **Search fields**: name, email, subject
- **Case sensitivity**: Case-insensitive
- **Search type**: Partial match (ILIKE)

### Message Status Flow

1. **unread** → New message received
2. **read** → Message has been viewed
3. **replied** → Reply has been sent
4. **archived** → Message archived (soft delete)

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:3000/api/docs` (when running)
- **Health Check**: `http://localhost:3000/api/v1/health`
- **Database Schema**: See `database/` folder for table structures

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Maintainer**: Flexify Development Team
