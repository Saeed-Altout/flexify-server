# 🚀 CV Builder Service - Postman Collection

A comprehensive Postman collection for testing all CV Builder service endpoints with detailed examples and request/response samples.

## 📋 Collection Overview

**Base URL**: `http://localhost:3000` (or your deployed URL)  
**Authentication**: Bearer Token (JWT from Supabase Auth)  
**Content-Type**: `application/json`

## 🔐 Authentication Setup

### 1. Get Authentication Token

```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh-token-here",
  "user": {
    "id": "user-uuid",
    "email": "your-email@example.com",
    "role": "USER"
  }
}
```

### 2. Set Environment Variable

In Postman, create an environment variable:

- **Variable**: `auth_token`
- **Initial Value**: `{{access_token}}` (from login response)

## 📚 CV Sections Management (Admin Only)

### Update CV Section Configuration

```http
PUT {{base_url}}/cv-builder/sections/skills
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "display_name": "Skills & Expertise",
  "description": "Technical and soft skills with proficiency levels",
  "is_active": true,
  "is_required": false,
  "sort_order": 2
}
```

**Response**:

```json
{
  "id": "section-uuid",
  "name": "skills",
  "display_name": "Skills & Expertise",
  "description": "Technical and soft skills with proficiency levels",
  "is_active": true,
  "is_required": false,
  "sort_order": 2,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get All CV Sections

```http
GET {{base_url}}/cv-builder/sections
Authorization: Bearer {{auth_token}}
```

**Response**:

```json
{
  "data": [
    {
      "id": "section-uuid-1",
      "name": "personal_info",
      "display_name": "Personal Information",
      "description": "Basic personal and contact information",
      "is_active": true,
      "is_required": true,
      "sort_order": 1
    },
    {
      "id": "section-uuid-2",
      "name": "skills",
      "display_name": "Skills & Expertise",
      "description": "Technical and soft skills",
      "is_active": true,
      "is_required": false,
      "sort_order": 2
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10,
  "next": null,
  "prev": null
}
```

## 👤 Personal Information Management

### Create/Update Personal Info

```http
POST {{base_url}}/cv-builder/personal-info
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "job_title": "Senior Full Stack Developer",
  "summary": "Experienced developer with 5+ years of expertise in React, Node.js, and cloud technologies. Passionate about creating scalable solutions and mentoring junior developers.",
  "profile_picture": "https://example.com/profile.jpg",
  "phone": "+1 (555) 123-4567",
  "address": "123 Developer Street, Tech City, TC 12345",
  "website": "https://myportfolio.com",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username"
}
```

**Response**:

```json
{
  "id": "personal-info-uuid",
  "user_id": "user-uuid",
  "job_title": "Senior Full Stack Developer",
  "summary": "Experienced developer with 5+ years of expertise...",
  "profile_picture": "https://example.com/profile.jpg",
  "phone": "+1 (555) 123-4567",
  "address": "123 Developer Street, Tech City, TC 12345",
  "website": "https://myportfolio.com",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Personal Info

```http
GET {{base_url}}/cv-builder/personal-info/{{user_id}}
Authorization: Bearer {{auth_token}}
```

### Update Personal Info

```http
PUT {{base_url}}/cv-builder/personal-info/{{personal_info_id}}
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "job_title": "Lead Full Stack Developer",
  "summary": "Updated summary with new achievements..."
}
```

## 🎯 Skills Management

### Create Skill

```http
POST {{base_url}}/cv-builder/skills
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "React.js",
  "description": "Frontend framework for building user interfaces",
  "level": 85,
  "category": "Frontend Development"
}
```

**Response**:

```json
{
  "id": "skill-uuid",
  "user_id": "user-uuid",
  "name": "React.js",
  "description": "Frontend framework for building user interfaces",
  "level": 85,
  "category": "Frontend Development",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Skills with Pagination & Filtering

```http
GET {{base_url}}/cv-builder/skills?page=1&limit=10&category=Frontend&q=react
Authorization: Bearer {{auth_token}}
```

**Response**:

```json
{
  "data": [
    {
      "id": "skill-uuid-1",
      "name": "React.js",
      "description": "Frontend framework",
      "level": 85,
      "category": "Frontend Development"
    },
    {
      "id": "skill-uuid-2",
      "name": "React Native",
      "description": "Mobile app development",
      "level": 75,
      "category": "Frontend Development"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10,
  "next": null,
  "prev": null
}
```

### Update Skill

```http
PUT {{base_url}}/cv-builder/skills/{{skill_id}}
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "level": 90,
  "description": "Updated description with new experience"
}
```

### Delete Skill

```http
DELETE {{base_url}}/cv-builder/skills/{{skill_id}}
Authorization: Bearer {{auth_token}}
```

## 💼 Experience Management

### Create Experience

```http
POST {{base_url}}/cv-builder/experience
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "title": "Senior Frontend Developer",
  "company": "TechCorp Inc.",
  "project_name": "E-commerce Platform Redesign",
  "seniority_level": "SENIOR",
  "location": "San Francisco, CA",
  "start_date": "2022-01-15",
  "end_date": "2023-12-31",
  "is_current": false,
  "description": "Led frontend development for a large-scale e-commerce platform serving 1M+ users. Implemented modern React patterns and optimized performance.",
  "key_achievements": [
    "Improved page load time by 40% through code splitting and lazy loading",
    "Implemented responsive design for mobile users, increasing mobile conversion by 25%",
    "Mentored 3 junior developers and established coding standards"
  ],
  "technologies": ["react", "typescript", "nextjs", "tailwindcss"]
}
```

**Response**:

```json
{
  "id": "experience-uuid",
  "user_id": "user-uuid",
  "title": "Senior Frontend Developer",
  "company": "TechCorp Inc.",
  "project_name": "E-commerce Platform Redesign",
  "seniority_level": "SENIOR",
  "location": "San Francisco, CA",
  "start_date": "2022-01-15",
  "end_date": "2023-12-31",
  "is_current": false,
  "description": "Led frontend development for a large-scale e-commerce platform...",
  "key_achievements": [
    "Improved page load time by 40% through code splitting and lazy loading",
    "Implemented responsive design for mobile users, increasing mobile conversion by 25%",
    "Mentored 3 junior developers and established coding standards"
  ],
  "technologies": ["react", "typescript", "nextjs", "tailwindcss"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Experiences with Filtering

```http
GET {{base_url}}/cv-builder/experience?page=1&limit=10&company=TechCorp&q=developer
Authorization: Bearer {{auth_token}}
```

### Update Experience

```http
PUT {{base_url}}/cv-builder/experience/{{experience_id}}
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "is_current": true,
  "end_date": null,
  "key_achievements": [
    "Improved page load time by 40% through code splitting and lazy loading",
    "Implemented responsive design for mobile users, increasing mobile conversion by 25%",
    "Mentored 3 junior developers and established coding standards",
    "New achievement: Led migration to Next.js 13 with App Router"
  ]
}
```

## 🎓 Education Management

### Create Education

```http
POST {{base_url}}/cv-builder/education
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "degree": "Bachelor of Science in Computer Science",
  "institution": "University of Technology",
  "location": "New York, NY",
  "start_date": "2018-09-01",
  "end_date": "2022-05-15",
  "is_current": false,
  "description": "Focused on software engineering, algorithms, and data structures. Graduated with honors and completed capstone project on machine learning applications."
}
```

**Response**:

```json
{
  "id": "education-uuid",
  "user_id": "user-uuid",
  "degree": "Bachelor of Science in Computer Science",
  "institution": "University of Technology",
  "location": "New York, NY",
  "start_date": "2018-09-01",
  "end_date": "2022-05-15",
  "is_current": false,
  "description": "Focused on software engineering, algorithms, and data structures...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Education List

```http
GET {{base_url}}/cv-builder/education?page=1&limit=10&institution=University&q=computer
Authorization: Bearer {{auth_token}}
```

## 🏆 Certifications Management

### Create Certification

```http
POST {{base_url}}/cv-builder/certifications
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "AWS Certified Solutions Architect - Associate",
  "issuer": "Amazon Web Services",
  "issue_date": "2023-06-15",
  "expiration_date": "2026-06-15",
  "credential_id": "AWS-12345-67890",
  "credential_url": "https://aws.amazon.com/verification"
}
```

**Response**:

```json
{
  "id": "certification-uuid",
  "user_id": "user-uuid",
  "name": "AWS Certified Solutions Architect - Associate",
  "issuer": "Amazon Web Services",
  "issue_date": "2023-06-15",
  "expiration_date": "2026-06-15",
  "credential_id": "AWS-12345-67890",
  "credential_url": "https://aws.amazon.com/verification",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Certifications

```http
GET {{base_url}}/cv-builder/certifications?page=1&limit=10&issuer=AWS&q=cloud
Authorization: Bearer {{auth_token}}
```

## 🏅 Awards Management

### Create Award

```http
POST {{base_url}}/cv-builder/awards
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Employee of the Year",
  "issuer": "TechCorp Inc.",
  "date": "2023-12-15",
  "description": "Recognized for outstanding contributions to project success, leadership in team collaboration, and innovative problem-solving approaches."
}
```

**Response**:

```json
{
  "id": "award-uuid",
  "user_id": "user-uuid",
  "name": "Employee of the Year",
  "issuer": "TechCorp Inc.",
  "date": "2023-12-15",
  "description": "Recognized for outstanding contributions to project success...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Awards

```http
GET {{base_url}}/cv-builder/awards?page=1&limit=10&issuer=TechCorp&q=employee
Authorization: Bearer {{auth_token}}
```

## 🎯 Interests Management

### Create Interest

```http
POST {{base_url}}/cv-builder/interests
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Open Source Contribution"
}
```

**Response**:

```json
{
  "id": "interest-uuid",
  "user_id": "user-uuid",
  "name": "Open Source Contribution",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Interests

```http
GET {{base_url}}/cv-builder/interests?page=1&limit=10&q=open
Authorization: Bearer {{auth_token}}
```

## 📞 References Management

### Create Reference

```http
POST {{base_url}}/cv-builder/references
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "John Smith",
  "position": "Engineering Manager",
  "company": "TechCorp Inc.",
  "email": "john.smith@techcorp.com",
  "phone": "+1 (555) 987-6543"
}
```

**Response**:

```json
{
  "id": "reference-uuid",
  "user_id": "user-uuid",
  "name": "John Smith",
  "position": "Engineering Manager",
  "company": "TechCorp Inc.",
  "email": "john.smith@techcorp.com",
  "phone": "+1 (555) 987-6543",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get References

```http
GET {{base_url}}/cv-builder/references?page=1&limit=10&company=TechCorp&q=manager
Authorization: Bearer {{auth_token}}
```

## 📄 Complete CV Generation

### Get Complete CV

```http
GET {{base_url}}/cv-builder/complete/{{user_id}}
Authorization: Bearer {{auth_token}}
```

**Response**:

```json
{
  "personal_info": {
    "id": "personal-info-uuid",
    "user_id": "user-uuid",
    "job_title": "Senior Full Stack Developer",
    "summary": "Experienced developer with 5+ years of expertise...",
    "profile_picture": "https://example.com/profile.jpg",
    "phone": "+1 (555) 123-4567",
    "address": "123 Developer Street, Tech City, TC 12345",
    "website": "https://myportfolio.com",
    "linkedin": "https://linkedin.com/in/username",
    "github": "https://github.com/username"
  },
  "skills": [
    {
      "id": "skill-uuid-1",
      "name": "React.js",
      "description": "Frontend framework",
      "level": 85,
      "category": "Frontend Development"
    }
  ],
  "experience": [
    {
      "id": "experience-uuid",
      "title": "Senior Frontend Developer",
      "company": "TechCorp Inc.",
      "project_name": "E-commerce Platform Redesign",
      "seniority_level": "SENIOR",
      "location": "San Francisco, CA",
      "start_date": "2022-01-15",
      "end_date": "2023-12-31",
      "is_current": false,
      "description": "Led frontend development for a large-scale e-commerce platform...",
      "key_achievements": [
        "Improved page load time by 40% through code splitting and lazy loading"
      ],
      "technologies": ["react", "typescript", "nextjs", "tailwindcss"]
    }
  ],
  "education": [
    {
      "id": "education-uuid",
      "degree": "Bachelor of Science in Computer Science",
      "institution": "University of Technology",
      "location": "New York, NY",
      "start_date": "2018-09-01",
      "end_date": "2022-05-15",
      "is_current": false,
      "description": "Focused on software engineering, algorithms, and data structures..."
    }
  ],
  "certifications": [
    {
      "id": "certification-uuid",
      "name": "AWS Certified Solutions Architect - Associate",
      "issuer": "Amazon Web Services",
      "issue_date": "2023-06-15",
      "expiration_date": "2026-06-15",
      "credential_id": "AWS-12345-67890",
      "credential_url": "https://aws.amazon.com/verification"
    }
  ],
  "awards": [
    {
      "id": "award-uuid",
      "name": "Employee of the Year",
      "issuer": "TechCorp Inc.",
      "date": "2023-12-15",
      "description": "Recognized for outstanding contributions to project success..."
    }
  ],
  "interests": [
    {
      "id": "interest-uuid",
      "name": "Open Source Contribution"
    }
  ],
  "references": [
    {
      "id": "reference-uuid",
      "name": "John Smith",
      "position": "Engineering Manager",
      "company": "TechCorp Inc.",
      "email": "john.smith@techcorp.com",
      "phone": "+1 (555) 987-6543"
    }
  ],
  "sections": [
    {
      "id": "section-uuid-1",
      "name": "personal_info",
      "display_name": "Personal Information",
      "is_active": true,
      "is_required": true,
      "sort_order": 1
    }
  ]
}
```

## 🔧 Postman Environment Variables

Create these environment variables in Postman:

| Variable           | Description              | Example Value                             |
| ------------------ | ------------------------ | ----------------------------------------- |
| `base_url`         | API base URL             | `http://localhost:3000`                   |
| `auth_token`       | JWT authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `user_id`          | Current user's UUID      | `550e8400-e29b-41d4-a716-446655440000`    |
| `personal_info_id` | Personal info record ID  | `personal-info-uuid`                      |
| `skill_id`         | Skill record ID          | `skill-uuid`                              |
| `experience_id`    | Experience record ID     | `experience-uuid`                         |
| `education_id`     | Education record ID      | `education-uuid`                          |
| `certification_id` | Certification record ID  | `certification-uuid`                      |
| `award_id`         | Award record ID          | `award-uuid`                              |
| `interest_id`      | Interest record ID       | `interest-uuid`                           |
| `reference_id`     | Reference record ID      | `reference-uuid`                          |

## 📝 Testing Workflow

### 1. Authentication Setup

1. Run the login request to get your JWT token
2. Set the `auth_token` environment variable
3. Set the `user_id` environment variable

### 2. CV Sections Configuration (Admin Only)

1. Update CV section configurations as needed
2. Verify sections are active/inactive as expected

### 3. Personal Information

1. Create/update personal information
2. Verify retrieval works correctly

### 4. Skills Management

1. Create multiple skills with different categories
2. Test pagination and filtering
3. Update and delete skills

### 5. Experience Management

1. Create experience entries with technologies
2. Test the technology validation (technologies must exist in Technologies service)
3. Verify CRUD operations

### 6. Other Sections

1. Test education, certifications, awards, interests, and references
2. Verify all CRUD operations work correctly

### 7. Complete CV Generation

1. Test the complete CV endpoint
2. Verify all active sections are populated

## ⚠️ Important Notes

1. **Technology Validation**: When creating experience entries, ensure all technologies exist in the Technologies service first
2. **Admin Access**: CV section management requires ADMIN role
3. **User Ownership**: Users can only manage their own CV data
4. **Authentication**: All endpoints require valid JWT tokens
5. **Data Types**: Dates should be in ISO format (YYYY-MM-DD)
6. **Skill Levels**: Skills use 0-100 scale for proficiency levels
7. **Seniority Levels**: Experience uses predefined enum values (JUNIOR, MID, SENIOR, LEAD, MANAGER, DIRECTOR, CTO)

## 🚀 Performance Testing

### Pagination Testing

- Test with different page sizes (1, 10, 50, 100)
- Verify pagination metadata (next, prev, total)
- Test edge cases (last page, empty results)

### Filtering Testing

- Test search queries with different lengths
- Test category/company/institution filters
- Test combinations of multiple filters

### Bulk Operations

- Create multiple records to test pagination
- Test filtering with large datasets
- Verify performance with complex queries

---

**Happy Testing! 🎯**

This collection covers all CV Builder service endpoints with realistic examples and comprehensive testing scenarios.
