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

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | development |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_SERVICE_KEY` | Supabase service key | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anon key | Yes | - |
| `JWT_SECRET` | JWT secret key | No | auto-generated |
| `JWT_EXPIRES_IN` | JWT expiration | No | 7d |
| `ALLOWED_ORIGINS` | CORS origins | No | localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
