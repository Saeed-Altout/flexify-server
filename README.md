# Flexify Server - Microservices API

A comprehensive microservices API built with NestJS, featuring authentication, project management, technology stack management, and contact messaging.

## 🏗️ Architecture

This application follows a clean microservices architecture with the following services:

### 🔐 Auth Microservice

- **Purpose**: User authentication and session management
- **Features**: Sign-up, sign-in, sign-out, profile management, password changes
- **Database**: `users` and `sessions` tables
- **Security**: JWT tokens, HTTP-only cookies, bcrypt password hashing

### 🛠️ Technologies Microservice

- **Purpose**: Technology stack management
- **Features**: CRUD operations for technologies, categorization, search
- **Database**: `technologies` table
- **Access**: Public read, Admin write

### 📁 Projects Microservice

- **Purpose**: Project portfolio management
- **Features**: Project CRUD, technology associations, public/private projects
- **Database**: `projects` table
- **Access**: User-owned projects, public project viewing

### 💬 Messages Microservice

- **Purpose**: Contact form and communication management
- **Features**: Message sending, admin management, replies, statistics
- **Database**: `messages` and `message_replies` tables
- **Access**: Public message sending, Admin management

### 🏥 Health Microservice

- **Purpose**: System monitoring and health checks
- **Features**: Health status, database connectivity, system metrics
- **Access**: Public health endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Supabase)
- Environment variables configured

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2. Database Setup

Run the database setup scripts in order:

```bash
# 1. Setup database schema
psql -h your_host -U your_user -d your_database -f database/01-setup.sql

# 2. Insert sample data (optional)
psql -h your_host -U your_user -d your_database -f database/02-sample-data.sql
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

### 5. Access the API

- **API Base URL**: `http://localhost:3000/api/v1`
- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                | Description          | Auth Required |
| ------ | ----------------------- | -------------------- | ------------- |
| POST   | `/auth/sign-up`         | User registration    | No            |
| POST   | `/auth/sign-in`         | User login           | No            |
| POST   | `/auth/sign-out`        | User logout          | Yes           |
| POST   | `/auth/refresh`         | Refresh access token | No            |
| GET    | `/auth/me`              | Get current user     | Yes           |
| PUT    | `/auth/profile`         | Update user profile  | Yes           |
| PUT    | `/auth/change-password` | Change password      | Yes           |

### Technologies Endpoints

| Method | Endpoint                           | Description             | Auth Required |
| ------ | ---------------------------------- | ----------------------- | ------------- |
| GET    | `/technologies`                    | Get technologies list   | No            |
| GET    | `/technologies/active`             | Get active technologies | No            |
| GET    | `/technologies/search`             | Search technologies     | No            |
| GET    | `/technologies/category/:category` | Get by category         | No            |
| GET    | `/technologies/:id`                | Get technology by ID    | No            |
| POST   | `/technologies`                    | Create technology       | Yes (Admin)   |
| PUT    | `/technologies/:id`                | Update technology       | Yes (Admin)   |
| DELETE | `/technologies/:id`                | Delete technology       | Yes (Admin)   |

### Projects Endpoints

| Method | Endpoint                          | Description           | Auth Required     |
| ------ | --------------------------------- | --------------------- | ----------------- |
| GET    | `/projects`                       | Get projects list     | No                |
| GET    | `/projects/public`                | Get public projects   | No                |
| GET    | `/projects/featured`              | Get featured projects | No                |
| GET    | `/projects/search`                | Search projects       | No                |
| GET    | `/projects/status/:status`        | Get by status         | No                |
| GET    | `/projects/my`                    | Get user's projects   | Yes               |
| GET    | `/projects/:id`                   | Get project by ID     | No                |
| GET    | `/projects/:id/with-technologies` | Get with tech details | No                |
| POST   | `/projects`                       | Create project        | Yes               |
| PUT    | `/projects/:id`                   | Update project        | Yes (Owner/Admin) |
| DELETE | `/projects/:id`                   | Delete project        | Yes (Owner/Admin) |

### Messages Endpoints

| Method | Endpoint                     | Description            | Auth Required |
| ------ | ---------------------------- | ---------------------- | ------------- |
| POST   | `/messages`                  | Send message           | No            |
| GET    | `/messages`                  | Get messages list      | Yes (Admin)   |
| GET    | `/messages/stats`            | Get message statistics | Yes (Admin)   |
| GET    | `/messages/search`           | Search messages        | Yes (Admin)   |
| GET    | `/messages/status/:status`   | Get by status          | Yes (Admin)   |
| GET    | `/messages/:id`              | Get message by ID      | Yes (Admin)   |
| GET    | `/messages/:id/with-replies` | Get with replies       | Yes (Admin)   |
| PUT    | `/messages/:id/status`       | Update status          | Yes (Admin)   |
| POST   | `/messages/:id/reply`        | Reply to message       | Yes (Admin)   |
| DELETE | `/messages/:id`              | Delete message         | Yes (Admin)   |

### Health Endpoints

| Method | Endpoint  | Description  | Auth Required |
| ------ | --------- | ------------ | ------------- |
| GET    | `/health` | Health check | No            |

## 🔧 Configuration

### Environment Variables

| Variable                 | Description              | Default             | Required |
| ------------------------ | ------------------------ | ------------------- | -------- |
| `PORT`                   | Server port              | 3000                | No       |
| `NODE_ENV`               | Environment              | development         | No       |
| `SUPABASE_URL`           | Supabase project URL     | -                   | Yes      |
| `SUPABASE_SERVICE_KEY`   | Supabase service key     | -                   | Yes      |
| `SUPABASE_ANON_KEY`      | Supabase anonymous key   | -                   | Yes      |
| `JWT_SECRET`             | JWT secret key           | -                   | Yes      |
| `JWT_REFRESH_SECRET`     | JWT refresh secret       | -                   | Yes      |
| `JWT_EXPIRES_IN`         | JWT expiration           | 15m                 | No       |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | 7d                  | No       |
| `ALLOWED_ORIGINS`        | CORS allowed origins     | localhost:3000,3001 | No       |
| `SMTP_HOST`              | SMTP host                | smtp.gmail.com      | No       |
| `SMTP_PORT`              | SMTP port                | 587                 | No       |
| `SMTP_USER`              | SMTP username            | -                   | No       |
| `SMTP_PASS`              | SMTP password            | -                   | No       |

### Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **sessions**: User session management
- **technologies**: Technology stack items
- **projects**: Project portfolio items
- **messages**: Contact form messages
- **message_replies**: Message replies

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-only Cookies**: Session management with secure cookies
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Built-in request rate limiting

## 🧪 Testing

### Sample Data

The application includes comprehensive sample data:

- **5 Sample Users**: Test accounts with password `password123`
- **12 Technologies**: Various frontend, backend, and DevOps technologies
- **5 Sample Projects**: Different project types and statuses
- **5 Sample Messages**: Contact form submissions
- **2 Sample Replies**: Admin responses to messages

### Test Credentials

| Email                  | Password    | Role  |
| ---------------------- | ----------- | ----- |
| admin@flexify.com      | admin123    | ADMIN |
| john.doe@example.com   | password123 | USER  |
| jane.smith@example.com | password123 | USER  |

## 📦 Deployment

### Vercel Deployment

The application is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

```env
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_KEY=your_production_service_key
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the API documentation at `/api/docs`
- Review the health endpoint at `/api/v1/health`

---

**Flexify Server** - Built with ❤️ using NestJS and modern web technologies.
