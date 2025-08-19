# 🚀 Technologies Service - Flexify Backend

## Overview

The Technologies Service provides a comprehensive CRUD API for managing predefined technologies that can be used in projects. This service ensures data consistency by maintaining a centralized list of valid technologies that projects can reference.

## 🏗️ Architecture

### Service Layer
- **TechnologiesService**: Core business logic for technology management
- **ProjectsService**: Enhanced with technology validation integration

### Controller Layer
- **TechnologiesController**: REST API endpoints for technology operations
- **ProjectsController**: Enhanced with technology-aware project operations

### Data Layer
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **Technologies Table**: Centralized storage for technology definitions

## 🔐 Security & Access Control

### Public Endpoints (No Authentication Required)
- `GET /technologies` - List all technologies with pagination
- `GET /technologies/all` - Get all technologies without pagination
- `GET /technologies/for-projects` - Get technology values for project forms
- `GET /technologies/:id` - Get technology by ID
- `GET /technologies/by-value/:value` - Get technology by value (slug)

### Admin-Only Endpoints (JWT Authentication Required)
- `POST /technologies` - Create new technology
- `POST /technologies/bulk` - Create multiple technologies at once
- `PUT /technologies/:id` - Update existing technology
- `DELETE /technologies/:id` - Delete technology (if not used in projects)

## 📊 Data Model

### Technology Entity
```typescript
interface Technology {
  id: string;           // UUID primary key
  label: string;        // Display name (e.g., "React.js")
  value: string;        // Unique identifier (e.g., "react")
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

### Key Constraints
- **Label**: Must be unique, max 100 characters
- **Value**: Must be unique, max 50 characters, lowercase
- **Uniqueness**: Both label and value must be globally unique

## 🔄 API Endpoints

### 1. Create Technology
```http
POST /technologies
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "label": "React.js",
  "value": "react"
}
```

### 2. Bulk Create Technologies
```http
POST /technologies/bulk
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "technologies": [
    { "label": "Vue.js", "value": "vue" },
    { "label": "Angular", "value": "angular" }
  ]
}
```

### 3. Update Technology
```http
PUT /technologies/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "label": "React.js v18",
  "value": "react"
}
```

### 4. Delete Technology
```http
DELETE /technologies/:id
Authorization: Bearer <JWT_TOKEN>
```

**Note**: Cannot delete if technology is used in any projects.

### 5. List Technologies (Paginated)
```http
GET /technologies?page=1&limit=10&q=react
```

### 6. Get Technologies for Projects
```http
GET /technologies/for-projects
```

Returns only the `value` field for use in project creation forms.

## 🔗 Integration with Projects Service

### Technology Validation
When creating or updating projects, the system automatically validates that all specified technologies exist in the predefined list:

```typescript
// In ProjectsService.create()
await this.validateTechnologies(dto.technologies);

// In ProjectsService.update()
if (dto.technologies) {
  await this.validateTechnologies(dto.technologies);
}
```

### Validation Logic
1. **Existence Check**: All technologies must exist in the technologies table
2. **Case Insensitive**: Technology values are compared case-insensitively
3. **Error Handling**: Invalid technologies result in a `BadRequestException`

## 🗄️ Database Schema

### Technologies Table
```sql
CREATE TABLE public.technologies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Row Level Security Policies
- **Public Read**: Anyone can read technologies
- **Admin Write**: Only users with `ADMIN` role can modify
- **Service Role**: Full access for backend operations

### Indexes
- `idx_technologies_label` - Optimized label lookups
- `idx_technologies_value` - Optimized value lookups
- `idx_technologies_created_at` - Optimized sorting

## 🚀 Setup Instructions

### 1. Database Migration
Run the `technologies-table.sql` script in your Supabase SQL Editor:

```bash
# Copy the contents of technologies-table.sql
# Paste into Supabase SQL Editor
# Execute the script
```

### 2. Verify Installation
Check that the technologies table was created and populated:

```sql
SELECT COUNT(*) FROM public.technologies;
-- Should return the number of predefined technologies
```

### 3. Test API Endpoints
Use the Swagger documentation at `/api` to test all endpoints.

## 📝 Usage Examples

### Frontend Integration

#### Technology Selection in Project Form
```typescript
// Fetch available technologies
const response = await fetch('/api/technologies/for-projects');
const { data: technologies } = await response.json();

// Use in form component
<Select>
  {technologies.map(tech => (
    <option key={tech} value={tech}>{tech}</option>
  ))}
</Select>
```

#### Admin Technology Management
```typescript
// Create new technology
const newTech = await fetch('/api/technologies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    label: 'Next.js',
    value: 'nextjs'
  })
});
```

### Backend Integration

#### Custom Technology Validation
```typescript
// In your service
@Injectable()
export class CustomService {
  constructor(private technologiesService: TechnologiesService) {}

  async validateCustomTechnologies(techs: string[]) {
    const validTechs = await this.technologiesService.getTechnologiesForProjects();
    const invalid = techs.filter(tech => !validTechs.includes(tech.toLowerCase()));
    
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid technologies: ${invalid.join(', ')}`);
    }
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test technologies.service.spec.ts
```

### Integration Tests
```bash
npm run test:e2e
```

### Manual Testing
1. **Create Technology**: Use Postman/Insomnia with admin JWT
2. **Validate Uniqueness**: Try creating duplicate label/value
3. **Project Integration**: Create project with valid/invalid technologies
4. **Delete Protection**: Try deleting technology used in projects

## 🔧 Configuration

### Environment Variables
No additional environment variables required. The service uses existing Supabase configuration.

### Rate Limiting
Consider implementing rate limiting for public endpoints to prevent abuse.

### Caching
Technologies are relatively static - consider implementing Redis caching for:
- `/technologies/all` endpoint
- `/technologies/for-projects` endpoint

## 🚨 Error Handling

### Common Error Scenarios
1. **Duplicate Technology**: `409 Conflict` - Label or value already exists
2. **Invalid Technology**: `400 Bad Request` - Technology not found in predefined list
3. **Delete Constraint**: `400 Bad Request` - Technology used in projects
4. **Unauthorized**: `403 Forbidden` - Admin privileges required

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Invalid technologies: invalid-tech. Please use only predefined technologies.",
  "error": "Bad Request"
}
```

## 🔮 Future Enhancements

### Planned Features
1. **Technology Categories**: Group technologies by type (Frontend, Backend, DevOps)
2. **Technology Versions**: Track version information for technologies
3. **Usage Analytics**: Track which technologies are most popular
4. **Bulk Import/Export**: CSV/JSON import/export functionality
5. **Technology Deprecation**: Mark technologies as deprecated

### Performance Optimizations
1. **Database Indexing**: Add composite indexes for common queries
2. **Query Optimization**: Implement query result caching
3. **Connection Pooling**: Optimize database connection management

## 📚 API Documentation

Full API documentation is available at `/api` when running the application.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update this documentation for any changes
4. Ensure all endpoints have proper error handling
5. Validate that RLS policies are correctly configured

## 📞 Support

For questions or issues:
1. Check the existing issues in the repository
2. Review the Swagger documentation
3. Test with the provided examples
4. Contact the development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Flexify Development Team
