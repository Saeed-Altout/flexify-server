# Profile Update Endpoint Documentation

## Overview

The profile update endpoint allows users to update their profile information excluding avatar and CV files, which should be updated via dedicated file upload endpoints.

## Endpoint Details

### **Update User Profile**

```http
PUT /auth/profile
```

### **Request Details**

- **Method**: `PUT`
- **URL**: `http://localhost:3000/auth/profile`
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <your-jwt-token>`

### **Request Body**

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "bio": "Passionate developer with 5+ years of experience in full-stack development. Love creating innovative solutions and learning new technologies."
}
```

### **Field Descriptions**

| Field   | Type   | Required | Description                | Validation                         |
| ------- | ------ | -------- | -------------------------- | ---------------------------------- |
| `name`  | string | No       | User's full name           | 2-100 characters                   |
| `email` | string | No       | User's email address       | Valid email format, must be unique |
| `bio`   | string | No       | User biography/description | Max 500 characters                 |

### **Excluded Fields**

The following fields are **NOT** allowed in this endpoint and should be updated via their respective endpoints:

- `avatar_url` - Use `POST /file-upload/profile-picture`
- `cv_file_url` - Use `POST /file-upload/cv-file`
- `cv_file_name` - Use `POST /file-upload/cv-file`
- `cv_file_size` - Use `POST /file-upload/cv-file`
- `cv_uploaded_at` - Use `POST /file-upload/cv-file`

### **Response Format**

#### **Success Response (200)**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.smith@example.com",
    "name": "John Smith",
    "bio": "Passionate developer with 5+ years of experience in full-stack development. Love creating innovative solutions and learning new technologies.",
    "avatar_url": "https://example.com/avatar.jpg",
    "cv_file_url": "https://example.com/cv.pdf",
    "cv_file_name": "resume.pdf",
    "cv_file_size": 1024000,
    "cv_uploaded_at": "2023-01-01T00:00:00Z",
    "role": "USER",
    "is_active": true,
    "email_verified": false,
    "last_login_at": "2023-01-01T00:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Profile updated successfully",
  "status": "success"
}
```

#### **Error Responses**

**400 Bad Request - Email Already Taken**

```json
{
  "data": null,
  "message": "Email is already taken by another user",
  "status": "error"
}
```

**400 Bad Request - Invalid Input**

```json
{
  "data": null,
  "message": "Validation failed",
  "status": "error"
}
```

**401 Unauthorized**

```json
{
  "data": null,
  "message": "Unauthorized",
  "status": "error"
}
```

**404 Not Found**

```json
{
  "data": null,
  "message": "User not found",
  "status": "error"
}
```

## Usage Examples

### **cURL Example**

```bash
curl -X PUT \
  http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "bio": "Passionate developer with 5+ years of experience in full-stack development."
  }'
```

### **JavaScript/Fetch Example**

```javascript
const updateProfile = async (profileData, token) => {
  const response = await fetch('/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  return await response.json();
};

// Usage
const profileData = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  bio: 'Passionate developer with 5+ years of experience in full-stack development.',
};

updateProfile(profileData, 'your-jwt-token')
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

### **HTML Form Example**

```html
<form id="profileForm">
  <div>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required />
  </div>

  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required />
  </div>

  <div>
    <label for="bio">Bio:</label>
    <textarea id="bio" name="bio" rows="4" cols="50" maxlength="500"></textarea>
  </div>

  <button type="submit">Update Profile</button>
</form>

<script>
  document
    .getElementById('profileForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const profileData = {
        name: formData.get('name'),
        email: formData.get('email'),
        bio: formData.get('bio'),
      };

      try {
        const response = await fetch('/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(profileData),
        });

        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    });
</script>
```

## Security Features

### **Email Uniqueness Validation**

- When updating email, the system checks if the email is already taken by another user
- Prevents duplicate email addresses in the system

### **Field Filtering**

- Avatar and CV file fields are automatically filtered out from updates
- These fields must be updated via their dedicated file upload endpoints

### **Authentication Required**

- Valid JWT token required in Authorization header
- Users can only update their own profile

### **Input Validation**

- All fields are validated according to their type and constraints
- Email format validation
- Name length validation (2-100 characters)
- Bio length validation (max 500 characters)

## Related Endpoints

### **File Upload Endpoints**

- **Avatar Upload**: `POST /file-upload/profile-picture`
- **CV File Upload**: `POST /file-upload/cv-file`

### **Other Profile Endpoints**

- **Get Current User**: `GET /auth/me`
- **Change Password**: `PUT /auth/change-password`

## Best Practices

1. **Always validate input** on the frontend before sending requests
2. **Handle errors gracefully** and provide user feedback
3. **Use appropriate HTTP status codes** for different scenarios
4. **Keep sensitive data secure** and never expose passwords
5. **Update avatar and CV files** using their dedicated endpoints
6. **Check email uniqueness** before attempting to update email

## Troubleshooting

### **Common Issues**

1. **Email Already Taken Error**
   - Check if the email is already in use by another user
   - Verify the email format is correct

2. **Validation Errors**
   - Ensure all required fields meet validation criteria
   - Check field lengths and formats

3. **Authentication Errors**
   - Verify JWT token is valid and not expired
   - Ensure token is included in Authorization header

4. **User Not Found**
   - Verify the user ID exists in the system
   - Check if the user account is active

### **Debug Steps**

1. Check server logs for detailed error messages
2. Verify JWT token validity
3. Test with minimal data first
4. Check database connectivity
5. Validate input data format

## API Documentation

This endpoint is fully documented in the Swagger/OpenAPI documentation available at:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

The Swagger documentation includes:

- Interactive API testing
- Request/response examples
- Schema definitions
- Error code descriptions
