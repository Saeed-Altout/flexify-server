# Change Password Endpoint Documentation

## Overview

The change password endpoint allows users to securely change their password with confirmation and automatic sign-out for security reasons.

## Endpoint Details

### **Change Password**

```http
PUT /auth/change-password
```

### **Request Details**

- **Method**: `PUT`
- **URL**: `http://localhost:3000/auth/change-password`
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <your-jwt-token>`

### **Request Body**

```json
{
  "current_password": "currentPassword123",
  "new_password": "newPassword123",
  "confirm_password": "newPassword123"
}
```

### **Field Descriptions**

| Field              | Type   | Required | Description             | Validation                       |
| ------------------ | ------ | -------- | ----------------------- | -------------------------------- |
| `current_password` | string | Yes      | User's current password | Must match existing password     |
| `new_password`     | string | Yes      | New password            | 8-100 characters, must be unique |
| `confirm_password` | string | Yes      | Confirm new password    | Must match new_password          |

### **Security Features**

- ✅ **Current Password Verification**: Must provide correct current password
- ✅ **Password Confirmation**: New password must be confirmed
- ✅ **Password Uniqueness**: New password must be different from current password
- ✅ **Automatic Sign-Out**: User is signed out after successful password change
- ✅ **Session Invalidation**: All user sessions are invalidated for security

### **Response Format**

#### **Success Response (200)**

```json
{
  "data": null,
  "message": "Password changed successfully. You have been signed out for security reasons.",
  "status": "success"
}
```

#### **Error Responses**

**400 Bad Request - Current Password Incorrect**

```json
{
  "data": null,
  "message": "Current password is incorrect",
  "status": "error"
}
```

**400 Bad Request - Passwords Don't Match**

```json
{
  "data": null,
  "message": "New password and confirm password do not match",
  "status": "error"
}
```

**400 Bad Request - Same Password**

```json
{
  "data": null,
  "message": "New password must be different from current password",
  "status": "error"
}
```

**400 Bad Request - Validation Failed**

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
  http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "current_password": "oldPassword123",
    "new_password": "newSecurePassword456",
    "confirm_password": "newSecurePassword456"
  }'
```

### **JavaScript/Fetch Example**

```javascript
const changePassword = async (passwordData, token) => {
  const response = await fetch('/auth/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  return await response.json();
};

// Usage
const passwordData = {
  current_password: 'oldPassword123',
  new_password: 'newSecurePassword456',
  confirm_password: 'newSecurePassword456',
};

changePassword(passwordData, 'your-jwt-token')
  .then((result) => {
    console.log(result);
    // User will be signed out, redirect to login
    if (result.status === 'success') {
      window.location.href = '/login';
    }
  })
  .catch((error) => console.error(error));
```

### **HTML Form Example**

```html
<form id="changePasswordForm">
  <div>
    <label for="current_password">Current Password:</label>
    <input
      type="password"
      id="current_password"
      name="current_password"
      required
    />
  </div>

  <div>
    <label for="new_password">New Password:</label>
    <input
      type="password"
      id="new_password"
      name="new_password"
      required
      minlength="8"
      maxlength="100"
    />
  </div>

  <div>
    <label for="confirm_password">Confirm New Password:</label>
    <input
      type="password"
      id="confirm_password"
      name="confirm_password"
      required
      minlength="8"
      maxlength="100"
    />
  </div>

  <button type="submit">Change Password</button>
</form>

<script>
  document
    .getElementById('changePasswordForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const passwordData = {
        current_password: formData.get('current_password'),
        new_password: formData.get('new_password'),
        confirm_password: formData.get('confirm_password'),
      };

      // Client-side validation
      if (passwordData.new_password !== passwordData.confirm_password) {
        alert('New password and confirm password do not match');
        return;
      }

      try {
        const response = await fetch('/auth/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(passwordData),
        });

        const result = await response.json();

        if (result.status === 'success') {
          alert('Password changed successfully. You will be signed out.');
          // Clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error changing password:', error);
        alert('An error occurred while changing password');
      }
    });
</script>
```

## Security Considerations

### **Password Requirements**

- **Minimum Length**: 8 characters
- **Maximum Length**: 100 characters
- **Uniqueness**: Must be different from current password
- **Confirmation**: Must be confirmed to prevent typos

### **Security Measures**

1. **Current Password Verification**: Ensures only authorized users can change passwords
2. **Password Confirmation**: Prevents accidental password changes due to typos
3. **Session Invalidation**: All user sessions are terminated after password change
4. **Automatic Sign-Out**: User must re-authenticate with new password
5. **Secure Hashing**: Passwords are hashed using bcrypt with salt rounds

### **User Experience**

- **Clear Error Messages**: Specific error messages for different validation failures
- **Automatic Redirect**: User is informed about sign-out and should be redirected to login
- **Form Validation**: Client-side validation for better UX

## Best Practices

### **Frontend Implementation**

1. **Clear the token** after successful password change
2. **Redirect to login page** immediately after password change
3. **Show confirmation message** before redirecting
4. **Validate passwords match** on the frontend before submitting
5. **Handle errors gracefully** with user-friendly messages

### **Backend Security**

1. **Always verify current password** before allowing changes
2. **Invalidate all sessions** after password change
3. **Use secure password hashing** (bcrypt with salt)
4. **Validate input thoroughly** on both client and server
5. **Log security events** for audit purposes

## Related Endpoints

### **Authentication Endpoints**

- **Sign In**: `POST /auth/sign-in`
- **Sign Out**: `POST /auth/sign-out`
- **Get Current User**: `GET /auth/me`

### **Profile Endpoints**

- **Update Profile**: `PUT /auth/profile`

## Troubleshooting

### **Common Issues**

1. **Current Password Incorrect**
   - Verify the current password is correct
   - Check for typos or case sensitivity

2. **Passwords Don't Match**
   - Ensure new_password and confirm_password are identical
   - Check for leading/trailing spaces

3. **Same Password Error**
   - New password must be different from current password
   - Choose a completely new password

4. **Validation Errors**
   - Ensure password meets length requirements (8-100 characters)
   - Check all required fields are provided

5. **Sign-Out After Change**
   - This is expected behavior for security
   - User must sign in again with new password

### **Debug Steps**

1. Check server logs for detailed error messages
2. Verify JWT token is valid and not expired
3. Test with minimal data first
4. Check password requirements are met
5. Ensure passwords match exactly

## API Documentation

This endpoint is fully documented in the Swagger/OpenAPI documentation available at:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

The Swagger documentation includes:

- Interactive API testing
- Request/response examples
- Schema definitions
- Error code descriptions
- Validation rules
