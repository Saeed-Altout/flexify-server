# Technology CRUD with Icon Upload API Documentation

## Overview

The Technology API now supports creating and updating technologies with optional icon uploads. Icons can be uploaded during technology creation or when updating existing technologies along with other data.

## Endpoints

### **1. Create Technology with Icon**

```http
POST /technologies
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
```

**Description**: Create a new technology with optional icon upload.

**Authentication**: Required (JWT token)

**Authorization**: Admin users only (recommended)

#### **Request Body (multipart/form-data)**

| Field         | Type   | Required | Description            | Validation             |
| ------------- | ------ | -------- | ---------------------- | ---------------------- |
| `name`        | string | Yes      | Technology name        | Required, unique       |
| `description` | string | No       | Technology description | Optional               |
| `category`    | string | No       | Technology category    | Optional               |
| `icon`        | binary | No       | Technology icon image  | Image formats, max 2MB |

#### **Supported Icon File Types**

- **Image Formats**: JPEG, JPG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, HEIF, ICO
- **Maximum Size**: 2MB
- **Recommended**: PNG or SVG for best quality and performance

#### **Success Response (201)**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend",
    "icon_url": "https://your-project.supabase.co/storage/v1/object/public/technology-icons/tech-123/1703123456789-abc123.png",
    "icon_filename": "react-icon.png",
    "icon_size": 1024,
    "icon_uploaded_at": "2023-01-01T00:00:00Z",
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Technology created successfully with icon",
  "status": "success"
}
```

### **2. Update Technology with Icon**

```http
PUT /technologies/{id}
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
```

**Description**: Update a technology with optional icon upload.

**Authentication**: Required (JWT token)

**Authorization**: Admin users only (recommended)

#### **URL Parameters**

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| `id`      | string | Yes      | Technology ID to update |

#### **Request Body (multipart/form-data)**

| Field         | Type    | Required | Description            | Validation                          |
| ------------- | ------- | -------- | ---------------------- | ----------------------------------- |
| `name`        | string  | No       | Technology name        | Optional, must be unique if changed |
| `description` | string  | No       | Technology description | Optional                            |
| `category`    | string  | No       | Technology category    | Optional                            |
| `is_active`   | boolean | No       | Is technology active   | Optional                            |
| `icon`        | binary  | No       | Technology icon image  | Image formats, max 2MB              |

#### **Success Response (200)**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend",
    "icon_url": "https://your-project.supabase.co/storage/v1/object/public/technology-icons/tech-123/1703123456790-def456.png",
    "icon_filename": "react-icon-v2.png",
    "icon_size": 2048,
    "icon_uploaded_at": "2023-01-02T00:00:00Z",
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z"
  },
  "message": "Technology updated successfully with new icon",
  "status": "success"
}
```

### **3. Get Technologies (with Icons)**

```http
GET /technologies
```

**Description**: Get a paginated list of technologies with their icons.

#### **Query Parameters**

| Parameter    | Type    | Required | Description                             |
| ------------ | ------- | -------- | --------------------------------------- |
| `category`   | string  | No       | Filter by category                      |
| `is_active`  | boolean | No       | Filter by active status                 |
| `search`     | string  | No       | Search term                             |
| `page`       | number  | No       | Page number (default: 1)                |
| `limit`      | number  | No       | Items per page (default: 10)            |
| `sort_by`    | string  | No       | Sort field (name, category, created_at) |
| `sort_order` | string  | No       | Sort order (asc, desc)                  |

#### **Success Response (200)**

```json
{
  "data": {
    "technologies": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "React",
        "description": "A JavaScript library for building user interfaces",
        "category": "Frontend",
        "icon_url": "https://your-project.supabase.co/storage/v1/object/public/technology-icons/tech-123/1703123456789-abc123.png",
        "icon_filename": "react-icon.png",
        "icon_size": 1024,
        "icon_uploaded_at": "2023-01-01T00:00:00Z",
        "is_active": true,
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  },
  "message": "Technologies retrieved successfully",
  "status": "success"
}
```

### **4. Get Technology by ID (with Icon)**

```http
GET /technologies/{id}
```

**Description**: Get a specific technology by its ID with icon information.

#### **URL Parameters**

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `id`      | string | Yes      | Technology ID |

#### **Success Response (200)**

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend",
    "icon_url": "https://your-project.supabase.co/storage/v1/object/public/technology-icons/tech-123/1703123456789-abc123.png",
    "icon_filename": "react-icon.png",
    "icon_size": 1024,
    "icon_uploaded_at": "2023-01-01T00:00:00Z",
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Technology retrieved successfully",
  "status": "success"
}
```

### **5. Delete Technology**

```http
DELETE /technologies/{id}
Authorization: Bearer {jwt_token}
```

**Description**: Delete a technology (Admin only).

**Note**: This does not automatically delete the associated icon file from storage.

## Usage Examples

### **Create Technology with Icon (cURL)**

```bash
curl -X POST \
  http://localhost:3000/technologies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=React" \
  -F "description=A JavaScript library for building user interfaces" \
  -F "category=Frontend" \
  -F "icon=@react-icon.png"
```

### **Update Technology with New Icon (cURL)**

```bash
curl -X PUT \
  http://localhost:3000/technologies/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=React" \
  -F "description=Updated description" \
  -F "category=Frontend" \
  -F "is_active=true" \
  -F "icon=@new-react-icon.png"
```

### **Update Technology without Icon (cURL)**

```bash
curl -X PUT \
  http://localhost:3000/technologies/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=React" \
  -F "description=Updated description" \
  -F "category=Frontend" \
  -F "is_active=true"
```

### **JavaScript/Fetch Examples**

#### **Create Technology with Icon**

```javascript
const createTechnologyWithIcon = async (technologyData, iconFile, token) => {
  const formData = new FormData();

  // Add text fields
  formData.append('name', technologyData.name);
  if (technologyData.description) {
    formData.append('description', technologyData.description);
  }
  if (technologyData.category) {
    formData.append('category', technologyData.category);
  }

  // Add icon file if provided
  if (iconFile) {
    formData.append('icon', iconFile);
  }

  const response = await fetch('/technologies', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
};

// Usage
const technologyData = {
  name: 'React',
  description: 'A JavaScript library for building user interfaces',
  category: 'Frontend',
};

const iconFile = document.getElementById('iconFile').files[0];

createTechnologyWithIcon(technologyData, iconFile, 'your-jwt-token')
  .then((result) => {
    if (result.status === 'success') {
      console.log('Technology created:', result.data);
      // Update UI with new technology
    } else {
      console.error('Creation failed:', result.message);
    }
  })
  .catch((error) => console.error('Error:', error));
```

#### **Update Technology with Icon**

```javascript
const updateTechnologyWithIcon = async (
  technologyId,
  updateData,
  iconFile,
  token,
) => {
  const formData = new FormData();

  // Add text fields
  if (updateData.name) formData.append('name', updateData.name);
  if (updateData.description)
    formData.append('description', updateData.description);
  if (updateData.category) formData.append('category', updateData.category);
  if (updateData.is_active !== undefined)
    formData.append('is_active', updateData.is_active);

  // Add icon file if provided
  if (iconFile) {
    formData.append('icon', iconFile);
  }

  const response = await fetch(`/technologies/${technologyId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
};

// Usage
const updateData = {
  name: 'React',
  description: 'Updated description',
  category: 'Frontend',
  is_active: true,
};

const newIconFile = document.getElementById('newIconFile').files[0];

updateTechnologyWithIcon(
  '123e4567-e89b-12d3-a456-426614174000',
  updateData,
  newIconFile,
  'your-jwt-token',
)
  .then((result) => {
    if (result.status === 'success') {
      console.log('Technology updated:', result.data);
      // Update UI with updated technology
    } else {
      console.error('Update failed:', result.message);
    }
  })
  .catch((error) => console.error('Error:', error));
```

### **React Component Examples**

#### **Create Technology Form**

```jsx
import React, { useState } from 'react';

const CreateTechnologyForm = ({ onTechnologyCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [iconFile, setIconFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.description)
        formDataToSend.append('description', formData.description);
      if (formData.category)
        formDataToSend.append('category', formData.category);
      if (iconFile) formDataToSend.append('icon', iconFile);

      const response = await fetch('/technologies', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.status === 'success') {
        onTechnologyCreated(result.data);
        setFormData({ name: '', description: '', category: '' });
        setIconFile(null);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to create technology. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="technology-form">
      <div>
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="icon">Icon (optional)</label>
        <input
          type="file"
          id="icon"
          accept="image/*"
          onChange={(e) => setIconFile(e.target.files[0])}
        />
        {iconFile && (
          <div className="file-preview">
            <img
              src={URL.createObjectURL(iconFile)}
              alt="Preview"
              style={{ width: 50, height: 50, objectFit: 'cover' }}
            />
            <span>{iconFile.name}</span>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={uploading}>
        {uploading ? 'Creating...' : 'Create Technology'}
      </button>
    </form>
  );
};

export default CreateTechnologyForm;
```

#### **Update Technology Form**

```jsx
import React, { useState, useEffect } from 'react';

const UpdateTechnologyForm = ({ technology, onTechnologyUpdated }) => {
  const [formData, setFormData] = useState({
    name: technology.name,
    description: technology.description || '',
    category: technology.category || '',
    is_active: technology.is_active,
  });
  const [iconFile, setIconFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      if (formData.name !== technology.name)
        formDataToSend.append('name', formData.name);
      if (formData.description !== (technology.description || ''))
        formDataToSend.append('description', formData.description);
      if (formData.category !== (technology.category || ''))
        formDataToSend.append('category', formData.category);
      if (formData.is_active !== technology.is_active)
        formDataToSend.append('is_active', formData.is_active);
      if (iconFile) formDataToSend.append('icon', iconFile);

      const response = await fetch(`/technologies/${technology.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.status === 'success') {
        onTechnologyUpdated(result.data);
        setIconFile(null);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update technology. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="technology-form">
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
          />
          Active
        </label>
      </div>

      <div>
        <label htmlFor="icon">New Icon (optional)</label>
        <input
          type="file"
          id="icon"
          accept="image/*"
          onChange={(e) => setIconFile(e.target.files[0])}
        />
        {iconFile && (
          <div className="file-preview">
            <img
              src={URL.createObjectURL(iconFile)}
              alt="Preview"
              style={{ width: 50, height: 50, objectFit: 'cover' }}
            />
            <span>{iconFile.name}</span>
          </div>
        )}
        {technology.icon_url && !iconFile && (
          <div className="current-icon">
            <img
              src={technology.icon_url}
              alt="Current icon"
              style={{ width: 50, height: 50, objectFit: 'cover' }}
            />
            <span>Current icon</span>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={uploading}>
        {uploading ? 'Updating...' : 'Update Technology'}
      </button>
    </form>
  );
};

export default UpdateTechnologyForm;
```

## Error Responses

### **400 Bad Request - Validation Failed**

```json
{
  "data": null,
  "message": "Technology with this name already exists",
  "status": "error"
}
```

### **400 Bad Request - Invalid File**

```json
{
  "data": null,
  "message": "Invalid file type. Allowed: image/jpeg, image/png, image/svg+xml, ...",
  "status": "error"
}
```

### **400 Bad Request - File Too Large**

```json
{
  "data": null,
  "message": "File too large. Max size: 2MB",
  "status": "error"
}
```

### **401 Unauthorized**

```json
{
  "data": null,
  "message": "Unauthorized",
  "status": "error"
}
```

### **404 Not Found**

```json
{
  "data": null,
  "message": "Technology not found",
  "status": "error"
}
```

## Database Schema

The `technologies` table includes the following icon-related fields:

| Field              | Type         | Description                            |
| ------------------ | ------------ | -------------------------------------- |
| `icon_url`         | TEXT         | Public URL of the uploaded icon        |
| `icon_filename`    | VARCHAR(255) | Original filename of the uploaded file |
| `icon_size`        | BIGINT       | File size in bytes                     |
| `icon_uploaded_at` | TIMESTAMP    | Upload timestamp                       |

## File Storage

Icons are stored in Supabase Storage under the `technology-icons` bucket:

```
technology-icons/
├── tech-{technology-id}/
│   ├── {timestamp}-{random}.png
│   └── {timestamp}-{random}.svg
```

## Best Practices

### **File Preparation**

1. **Optimize Images**: Compress images before upload for better performance
2. **Use Appropriate Formats**:
   - PNG for icons with transparency
   - SVG for scalable vector icons
   - WebP for modern browsers
3. **Consistent Dimensions**: Use square aspect ratios (e.g., 64x64, 128x128)
4. **File Size**: Keep under 2MB, ideally under 500KB

### **Frontend Implementation**

1. **Preview Before Upload**: Show image preview before submitting
2. **Progress Indicators**: Display upload progress for better UX
3. **Error Handling**: Provide clear error messages
4. **Fallback Icons**: Handle cases where icons fail to load
5. **Form Validation**: Validate file types and sizes on the client side

### **API Usage**

1. **Optional Icons**: Icons are always optional in both create and update operations
2. **Partial Updates**: You can update just the icon, just the data, or both
3. **Idempotent Operations**: Multiple updates with the same data are safe
4. **Error Recovery**: Handle upload failures gracefully

## Migration Notes

If you're upgrading from the previous version:

1. **Database**: Run the migration script `database/12-add-technology-icons.sql`
2. **Storage**: Create the `technology-icons` bucket in Supabase
3. **RLS Policies**: Set up the required storage policies
4. **Frontend**: Update forms to use `multipart/form-data` for create/update operations

## Support

For issues with this API:

1. Check the troubleshooting section in the main technology icon documentation
2. Verify all configuration steps are completed
3. Test with minimal examples first
4. Check server logs for detailed error information
