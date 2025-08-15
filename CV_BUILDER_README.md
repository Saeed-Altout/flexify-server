# 🎯 CV Builder Service

A comprehensive CV (Curriculum Vitae) management service that allows users to build and manage their professional profiles with multiple customizable sections.

## ✨ Features

- **Modular Design**: Scalable architecture that allows admins to activate/disable CV sections
- **User-Specific Data**: Each user manages their own CV data with proper authentication
- **Admin Controls**: Administrators can configure which sections are active and their display order
- **Technology Integration**: Seamless integration with the existing Technologies service
- **Rich Data Types**: Support for various professional information types (skills, experience, education, etc.)
- **Pagination & Filtering**: Advanced query capabilities for all list endpoints
- **Complete CV Generation**: Generate a complete CV with all active sections

## 🗄️ Database Setup

### 1. Run the Migration Script

Execute the `cv-builder-tables.sql` script in your Supabase SQL Editor:

```sql
-- Run the complete migration script
-- This creates all necessary tables, policies, triggers, and indexes
```

### 2. Verify Setup

After running the script, you should see:

- 9 new tables created
- Row Level Security (RLS) enabled on all tables
- Default CV sections inserted
- Proper indexes for performance

## 🚀 API Endpoints

### Base URL

```
/cv-builder
```

### Authentication

All endpoints require authentication via Bearer token in the Authorization header.

### CV Sections Management (Admin Only)

#### Update CV Section Configuration

```http
PUT /cv-builder/sections/:name
```

**Parameters:**

- `name`: Section identifier (e.g., 'skills', 'experience')

**Body:**

```json
{
  "display_name": "Skills & Expertise",
  "description": "Technical and soft skills",
  "is_active": true,
  "is_required": false,
  "sort_order": 2
}
```

#### Get All CV Sections

```http
GET /cv-builder/sections
```

### Personal Information

#### Create/Update Personal Info

```http
POST /cv-builder/personal-info
```

**Body:**

```json
{
  "job_title": "Senior Full Stack Developer",
  "summary": "Experienced developer with expertise in React, Node.js, and cloud technologies",
  "profile_picture": "https://example.com/profile.jpg",
  "phone": "+1234567890",
  "address": "123 Developer St, Tech City, TC 12345",
  "website": "https://myportfolio.com",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username"
}
```

#### Get Personal Info

```http
GET /cv-builder/personal-info/:userId
```

### Skills Management

#### Create Skill

```http
POST /cv-builder/skills
```

**Body:**

```json
{
  "name": "React.js",
  "description": "Frontend framework for building user interfaces",
  "level": 85,
  "category": "Frontend Development"
}
```

#### Update Skill

```http
PUT /cv-builder/skills/:id
```

#### Delete Skill

```http
DELETE /cv-builder/skills/:id
```

#### Get Skill

```http
GET /cv-builder/skills/:id
```

#### Get Skills (with pagination & filtering)

```http
GET /cv-builder/skills?page=1&limit=10&category=Frontend&q=react
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `q`: Search query

### Experience Management

#### Create Experience

```http
POST /cv-builder/experience
```

**Body:**

```json
{
  "title": "Senior Frontend Developer",
  "company": "TechCorp Inc.",
  "project_name": "E-commerce Platform",
  "seniority_level": "SENIOR",
  "location": "San Francisco, CA",
  "start_date": "2022-01-15",
  "end_date": "2023-12-31",
  "is_current": false,
  "description": "Led frontend development for a large-scale e-commerce platform",
  "key_achievements": [
    "Improved page load time by 40%",
    "Implemented responsive design for mobile users"
  ],
  "technologies": ["react", "typescript", "nextjs"]
}
```

**Note:** Technologies must exist in the Technologies service before being used.

#### Update Experience

```http
PUT /cv-builder/experience/:id
```

#### Delete Experience

```http
DELETE /cv-builder/experience/:id
```

#### Get Experience

```http
GET /cv-builder/experience/:id
```

#### Get Experiences (with pagination & filtering)

```http
GET /cv-builder/experience?page=1&limit=10&company=TechCorp&q=developer
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `company`: Filter by company
- `q`: Search query

### Education Management

#### Create Education

```http
POST /cv-builder/education
```

**Body:**

```json
{
  "degree": "Bachelor of Science in Computer Science",
  "institution": "University of Technology",
  "location": "New York, NY",
  "start_date": "2018-09-01",
  "end_date": "2022-05-15",
  "is_current": false,
  "description": "Focused on software engineering and algorithms"
}
```

#### Update Education

```http
PUT /cv-builder/education/:id
```

#### Delete Education

```http
DELETE /cv-builder/education/:id
```

#### Get Education

```http
GET /cv-builder/education/:id
```

#### Get Education List (with pagination & filtering)

```http
GET /cv-builder/education?page=1&limit=10&institution=University&q=computer
```

### Certifications Management

#### Create Certification

```http
POST /cv-builder/certifications
```

**Body:**

```json
{
  "name": "AWS Certified Solutions Architect",
  "issuer": "Amazon Web Services",
  "issue_date": "2023-06-15",
  "expiration_date": "2026-06-15",
  "credential_id": "AWS-123456",
  "credential_url": "https://aws.amazon.com/verification"
}
```

#### Update Certification

```http
PUT /cv-builder/certifications/:id
```

#### Delete Certification

```http
DELETE /cv-builder/certifications/:id
```

#### Get Certification

```http
GET /cv-builder/certifications/:id
```

#### Get Certifications (with pagination & filtering)

```http
GET /cv-builder/certifications?page=1&limit=10&issuer=AWS&q=cloud
```

### Awards Management

#### Create Award

```http
POST /cv-builder/awards
```

**Body:**

```json
{
  "name": "Employee of the Year",
  "issuer": "TechCorp Inc.",
  "date": "2023-12-15",
  "description": "Recognized for outstanding contributions to project success"
}
```

#### Update Award

```http
PUT /cv-builder/awards/:id
```

#### Delete Award

```http
DELETE /cv-builder/awards/:id
```

#### Get Award

```http
GET /cv-builder/awards/:id
```

#### Get Awards (with pagination & filtering)

```http
GET /cv-builder/awards?page=1&limit=10&issuer=TechCorp&q=employee
```

### Interests Management

#### Create Interest

```http
POST /cv-builder/interests
```

**Body:**

```json
{
  "name": "Open Source Contribution"
}
```

#### Update Interest

```http
PUT /cv-builder/interests/:id
```

#### Delete Interest

```http
DELETE /cv-builder/interests/:id
```

#### Get Interest

```http
GET /cv-builder/interests/:id
```

#### Get Interests (with pagination & filtering)

```http
GET /cv-builder/interests?page=1&limit=10&q=open
```

### References Management

#### Create Reference

```http
POST /cv-builder/references
```

**Body:**

```json
{
  "name": "John Smith",
  "position": "Engineering Manager",
  "company": "TechCorp Inc.",
  "email": "john.smith@techcorp.com",
  "phone": "+1234567890"
}
```

#### Update Reference

```http
PUT /cv-builder/references/:id
```

#### Delete Reference

```http
DELETE /cv-builder/references/:id
```

#### Get Reference

```http
GET /cv-builder/references/:id
```

#### Get References (with pagination & filtering)

```http
GET /cv-builder/references?page=1&limit=10&company=TechCorp&q=manager
```

### Complete CV Generation

#### Get Complete CV

```http
GET /cv-builder/complete/:userId
```

Returns a complete CV object with all active sections populated with user data.

## 🔐 Security & Permissions

### Row Level Security (RLS)

- **Users**: Can only manage their own CV data
- **Admins**: Can manage all CV data and section configurations
- **Service Role**: Full access for backend operations

### Authentication Required

All endpoints require a valid JWT token from Supabase Auth.

## 📊 Data Models

### CV Section

```typescript
interface CVSection {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

### Seniority Levels

```typescript
type SeniorityLevel =
  | 'JUNIOR'
  | 'MID'
  | 'SENIOR'
  | 'LEAD'
  | 'MANAGER'
  | 'DIRECTOR'
  | 'CTO';
```

### Skill Level

Skills use a 0-100 scale for proficiency levels.

## 🚀 Getting Started

### 1. Database Setup

Run the migration script in Supabase SQL Editor.

### 2. Service Integration

The CV Builder service is automatically integrated into your NestJS application.

### 3. API Usage

Start using the endpoints with proper authentication.

## 🔧 Configuration

### Default CV Sections

The service comes with 8 pre-configured sections:

1. Personal Information (required)
2. Skills
3. Work Experience
4. Education
5. Certifications
6. Awards & Recognition
7. Interests
8. References

### Customization

Admins can:

- Activate/deactivate sections
- Change display names and descriptions
- Modify sort order
- Add new sections in the future

## 📝 Examples

### Creating a Complete CV Profile

1. **Set Personal Information**

```bash
POST /cv-builder/personal-info
{
  "job_title": "Full Stack Developer",
  "summary": "Passionate developer with 5+ years of experience"
}
```

2. **Add Skills**

```bash
POST /cv-builder/skills
{
  "name": "JavaScript",
  "level": 90,
  "category": "Programming Languages"
}
```

3. **Add Experience**

```bash
POST /cv-builder/experience
{
  "title": "Senior Developer",
  "company": "TechCorp",
  "seniority_level": "SENIOR",
  "start_date": "2022-01-01",
  "technologies": ["javascript", "react", "nodejs"]
}
```

4. **Generate Complete CV**

```bash
GET /cv-builder/complete/{userId}
```

## 🐛 Error Handling

The service returns appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `204`: No Content (for deletions)
- `400`: Bad Request
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 🔄 Scalability

The service is designed to be easily extensible:

- New CV sections can be added by inserting into `cv_sections`
- Section configurations are dynamic and admin-controlled
- Database schema supports future enhancements
- Modular service architecture allows easy feature additions

## 📚 Related Services

- **Technologies Service**: Manages technology definitions used in experience entries
- **Auth Service**: Handles user authentication and authorization
- **Supabase Service**: Database and storage operations

## 🤝 Contributing

When adding new features:

1. Follow the existing code patterns
2. Add proper validation and error handling
3. Update this documentation
4. Add appropriate tests
5. Follow the established naming conventions

---

**Note**: This service integrates seamlessly with your existing NestJS application and follows all established patterns for consistency and maintainability.
