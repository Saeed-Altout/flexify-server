# 📚 Flexify Server API Documentation

## 🌐 Base URL

- **Production**: `https://flexify-server.vercel.app`
- **Development**: `http://localhost:3000`

## 📖 Interactive Documentation

- **Swagger UI**: [https://flexify-server.vercel.app/api/docs](https://flexify-server.vercel.app/api/docs)
- **Health Check**: [https://flexify-server.vercel.app/api/v1/health](https://flexify-server.vercel.app/api/v1/health)

## 🔐 Authentication

### Session-based Authentication (Recommended)

The API uses HTTP-only cookies for session management. When you sign in or sign up, a session token is automatically set as a cookie.

### Bearer Token Authentication

You can also use JWT tokens in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📋 API Endpoints

### 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint    | Description              | Auth Required |
| ------ | ----------- | ------------------------ | ------------- |
| `POST` | `/sign-up`  | Create new user account  | ❌            |
| `POST` | `/sign-in`  | Authenticate user        | ❌            |
| `POST` | `/sign-out` | Sign out current user    | ✅            |
| `GET`  | `/me`       | Get current user profile | ✅            |

### 🏥 Health (`/api/v1/health`)

| Method | Endpoint | Description                | Auth Required |
| ------ | -------- | -------------------------- | ------------- |
| `GET`  | `/`      | Check server health status | ❌            |

### 🛠️ Technologies (`/api/v1/technologies`)

| Method   | Endpoint | Description           | Auth Required |
| -------- | -------- | --------------------- | ------------- |
| `GET`    | `/`      | List all technologies | ❌            |
| `POST`   | `/`      | Create new technology | ✅ (Admin)    |
| `PUT`    | `/:id`   | Update technology     | ✅ (Admin)    |
| `DELETE` | `/:id`   | Delete technology     | ✅ (Admin)    |

### 📁 Projects (`/api/v1/projects`)

| Method   | Endpoint | Description         | Auth Required |
| -------- | -------- | ------------------- | ------------- |
| `GET`    | `/`      | List user projects  | ✅            |
| `POST`   | `/`      | Create new project  | ✅            |
| `GET`    | `/:id`   | Get project details | ✅            |
| `PUT`    | `/:id`   | Update project      | ✅            |
| `DELETE` | `/:id`   | Delete project      | ✅            |

### 💬 Messages (`/api/v1/messages`)

| Method | Endpoint       | Description           | Auth Required |
| ------ | -------------- | --------------------- | ------------- |
| `GET`  | `/`            | List messages (Admin) | ✅ (Admin)    |
| `POST` | `/`            | Create new message    | ❌            |
| `GET`  | `/:id`         | Get message details   | ✅            |
| `PUT`  | `/:id`         | Update message        | ✅ (Admin)    |
| `POST` | `/:id/replies` | Reply to message      | ✅            |

## 📝 Request/Response Format

### Standard Response Format

```json
{
  "data": <response_data_or_null>,
  "message": "Success message",
  "status": "success"
}
```

### Error Response Format

```json
{
  "data": null,
  "message": "Error description",
  "status": "error"
}
```

## 🔧 Example Requests

### Sign Up

```bash
curl -X POST https://flexify-server.vercel.app/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "password": "securePassword123"
  }'
```

### Sign In

```bash
curl -X POST https://flexify-server.vercel.app/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

### Get Current User

```bash
curl -X GET https://flexify-server.vercel.app/api/v1/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create Project

```bash
curl -X POST https://flexify-server.vercel.app/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "My New Project",
    "description": "Project description",
    "status": "planning"
  }'
```

### Get Technologies

```bash
curl -X GET https://flexify-server.vercel.app/api/v1/technologies
```

## 🚀 Quick Start

1. **Check Server Health**

   ```bash
   curl https://flexify-server.vercel.app/api/v1/health
   ```

2. **Sign Up**

   ```bash
   curl -X POST https://flexify-server.vercel.app/api/v1/auth/sign-up \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "name": "Test User"}'
   ```

3. **Sign In**

   ```bash
   curl -X POST https://flexify-server.vercel.app/api/v1/auth/sign-in \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "your_password"}'
   ```

4. **Use the Session Cookie** (automatically set) or **JWT Token** for authenticated requests

## 🔒 Security Features

- **HTTP-only Cookies**: Session tokens are stored in secure, HTTP-only cookies
- **CORS Enabled**: Cross-origin requests are properly configured
- **Input Validation**: All inputs are validated using DTOs
- **Rate Limiting**: Built-in protection against abuse
- **Row Level Security**: Database-level security with Supabase RLS

## 📊 Status Codes

| Code  | Description                             |
| ----- | --------------------------------------- |
| `200` | OK - Request successful                 |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid input data        |
| `401` | Unauthorized - Authentication required  |
| `403` | Forbidden - Insufficient permissions    |
| `404` | Not Found - Resource not found          |
| `500` | Internal Server Error - Server error    |

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Access Swagger UI
open http://localhost:3000/api/docs
```

### Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
```

## 📞 Support

- **Documentation**: [https://flexify-server.vercel.app/api/docs](https://flexify-server.vercel.app/api/docs)
- **Health Check**: [https://flexify-server.vercel.app/api/v1/health](https://flexify-server.vercel.app/api/v1/health)
- **Status Page**: [https://flexify-server.vercel.app](https://flexify-server.vercel.app)

---

**Built with ❤️ using NestJS, Supabase, and TypeScript**
