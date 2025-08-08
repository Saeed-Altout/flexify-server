<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Flexify Auth Service

A NestJS microservice for user authentication using Supabase as the authentication provider.

## 🎯 Features

- **Supabase Integration**: Full integration with Supabase Auth for user management
- **JWT Token Management**: Secure token handling with HTTP-only cookies
- **User Registration**: Email and name-based registration (password optional)
- **User Authentication**: Login, logout, and session management
- **Protected Routes**: Route protection with AuthGuard
- **Microservice Ready**: Designed for microservices architecture
- **TypeScript**: Full TypeScript support with proper typing

## 🏗️ Architecture

```
src/
├── config/
│   └── configuration.ts          # Environment configuration
├── controllers/
│   └── auth.controller.ts        # Auth endpoints
├── dto/
│   └── auth.dto.ts              # Data transfer objects
├── guards/
│   └── auth.guard.ts            # Authentication guard
├── middleware/
│   └── cookie-parser.middleware.ts # Cookie parsing middleware
├── modules/
│   └── auth.module.ts           # Auth module
├── services/
│   ├── auth.service.ts          # Main auth service
│   └── supabase.service.ts      # Supabase integration
├── types/
│   └── auth.types.ts            # TypeScript types
└── decorators/
    └── current-user.decorator.ts # Current user decorator
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 📚 API Endpoints

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "optional_password"
}
```

#### Login User

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

#### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
# or via HTTP-only cookie
```

#### Verify Authentication

```http
GET /api/v1/auth/verify
Authorization: Bearer <token>
# or via HTTP-only cookie
```

#### Logout User

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
# or via HTTP-only cookie
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
Authorization: Bearer <token>
# or via HTTP-only cookie
```

## 🔐 Security Features

### JWT Token Management

- Tokens are stored in HTTP-only cookies for enhanced security
- Automatic token refresh mechanism
- Secure cookie configuration (httpOnly, secure, sameSite)

### Authentication Guard

- Route protection with `@UseGuards(AuthGuard)`
- Automatic token validation
- User context injection with `@CurrentUser()` decorator

### Input Validation

- DTO-based validation using class-validator
- Automatic request sanitization
- Type-safe request handling

## 🏗️ Microservices Integration

### For Other Services

To integrate with other microservices, use the `AuthGuard` and `@CurrentUser()` decorator:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserProfile } from '../types/auth.types';

@Controller('protected')
@UseGuards(AuthGuard)
export class ProtectedController {
  @Get('profile')
  getProfile(@CurrentUser() user: UserProfile) {
    return { user };
  }
}
```

### Token Validation

For inter-service communication, validate tokens using the `AuthService`:

```typescript
// In another service
const isValid = await authService.validateToken(token);
if (isValid) {
  // Token is valid, proceed with request
}
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## 📦 Deployment

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Environment Variables

Ensure all required environment variables are set in your deployment environment:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `NODE_ENV`
- `ALLOWED_ORIGINS`

## 🔧 Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys from the dashboard
3. Configure authentication settings in Supabase dashboard
4. Set up email templates and authentication providers as needed

### Environment Variables

| Variable               | Description          | Required | Default        |
| ---------------------- | -------------------- | -------- | -------------- |
| `PORT`                 | Server port          | No       | 3000           |
| `NODE_ENV`             | Environment          | No       | development    |
| `SUPABASE_URL`         | Supabase project URL | Yes      | -              |
| `SUPABASE_SERVICE_KEY` | Supabase service key | Yes      | -              |
| `SUPABASE_ANON_KEY`    | Supabase anon key    | Yes      | -              |
| `JWT_SECRET`           | JWT secret key       | No       | auto-generated |
| `JWT_EXPIRES_IN`       | JWT expiration       | No       | 7d             |
| `ALLOWED_ORIGINS`      | CORS origins         | No       | localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

# Flexify Backend

A comprehensive authentication service built with NestJS and Supabase.

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd flexify-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run the application**
   ```bash
   npm run start:dev
   ```

## 🔐 Authentication Endpoints

### Endpoints

- `POST /api/v1/auth/sign-up` - Register a new user
- `POST /api/v1/auth/sign-in` - Sign in user
- `POST /api/v1/auth/sign-out` - Sign out user
- `GET /api/v1/auth/me` - Get current user profile

### Response Format

All responses follow a standard format:

```typescript
{
  data: {} | [] | null,
  message: string,
  status: string
}
```

### Cookie Management

The authentication system uses cookies for session management. Cookies are set to be accessible by frontend JavaScript for seamless user experience.

#### Cookie Configuration

- **auth-token**: Contains the JWT access token
- **user**: Contains the user profile data as JSON string

#### Cookie Settings

- `httpOnly: false` - Allows frontend JavaScript to read cookies
- `secure: true` - HTTPS only in production
- `sameSite: 'lax'` - CSRF protection
- `maxAge: 7 days` - Token expiry
- `path: '/'` - Available across the site

## 🍪 Frontend Integration

### Reading Cookies in Frontend

```javascript
// Utility function to get cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Get user data
const userData = getCookie('user');
const user = userData ? JSON.parse(userData) : null;

// Get auth token
const authToken = getCookie('auth-token');
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read user data from cookie
    const userData = getCookie('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const signIn = async (credentials) => {
    const response = await fetch('/api/v1/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (result.status === 'success') {
      // User data is automatically set in cookies
      setUser(result.data);
    }
    return result;
  };

  const signOut = async () => {
    await fetch('/api/v1/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
```

### Vue.js Example

```javascript
// composables/useAuth.js
import { ref, onMounted } from 'vue';

export function useAuth() {
  const user = ref(null);
  const loading = ref(true);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  onMounted(() => {
    const userData = getCookie('user');
    if (userData) {
      user.value = JSON.parse(userData);
    }
    loading.value = false;
  });

  const signIn = async (credentials) => {
    const response = await fetch('/api/v1/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (result.status === 'success') {
      user.value = result.data;
    }
    return result;
  };

  const signOut = async () => {
    await fetch('/api/v1/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
    });
    user.value = null;
  };

  return { user, loading, signIn, signOut };
}
```

### Angular Example

```typescript
// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromCookie();
  }

  private loadUserFromCookie() {
    const userData = this.getCookie('user');
    if (userData) {
      this.userSubject.next(JSON.parse(userData));
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  signIn(credentials: any): Observable<any> {
    return this.http.post('/api/v1/auth/sign-in', credentials, {
      withCredentials: true,
    });
  }

  signOut(): Observable<any> {
    return this.http.post(
      '/api/v1/auth/sign-out',
      {},
      {
        withCredentials: true,
      },
    );
  }
}
```

## 🔒 Security Considerations

### Cookie Security

1. **HttpOnly**: Set to `false` to allow frontend access
2. **Secure**: Only sent over HTTPS in production
3. **SameSite**: Set to `lax` for CSRF protection
4. **Domain**: Configurable for production environments
5. **Path**: Set to `/` for site-wide access

### CORS Configuration

The application is configured with proper CORS settings:

- **Development**: Allows all origins with credentials
- **Production**: Configurable allowed origins

### Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Cookie Configuration (Production)
COOKIE_DOMAIN=your-domain.com
NODE_ENV=production

# CORS Configuration (Production)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 📚 API Documentation

Visit `http://localhost:3000/api/docs` for interactive API documentation.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set production environment variables**

   ```bash
   NODE_ENV=production
   COOKIE_DOMAIN=your-domain.com
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

3. **Start the application**
   ```bash
   npm run start:prod
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
