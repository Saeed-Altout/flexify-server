# Technology Icon Upload API Documentation

## Overview

The Technology Icon Upload API allows administrators to upload and manage icons for technologies in the Flexify application.

## Endpoint

### **Upload Technology Icon**

```http
POST /technologies/{id}/icon
```

**Description**: Upload an icon image for a specific technology.

**Authentication**: Required (JWT token)

**Authorization**: Admin users only (recommended)

## Request Details

### **URL Parameters**

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| `id`      | string | Yes      | Technology ID to upload icon for |

### **Request Headers**

| Header          | Value                 | Required |
| --------------- | --------------------- | -------- |
| `Authorization` | `Bearer {jwt_token}`  | Yes      |
| `Content-Type`  | `multipart/form-data` | Yes      |

### **Request Body**

| Field  | Type   | Required | Description     | Validation             |
| ------ | ------ | -------- | --------------- | ---------------------- |
| `file` | binary | Yes      | Icon image file | Image formats, max 2MB |

### **Supported File Types**

- **Image Formats**: JPEG, JPG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, HEIF, ICO
- **Maximum Size**: 2MB
- **Recommended**: PNG or SVG for best quality and performance

## Response Format

### **Success Response (201)**

```json
{
  "data": {
    "url": "https://your-project.supabase.co/storage/v1/object/public/technology-icons/tech-123/1703123456789-abc123.png",
    "path": "tech-123/1703123456789-abc123.png",
    "filename": "1703123456789-abc123.png"
  },
  "message": "Technology icon uploaded successfully",
  "status": "success"
}
```

### **Error Responses**

#### **400 Bad Request - Invalid File**

```json
{
  "data": null,
  "message": "Invalid file type. Allowed: image/jpeg, image/png, image/svg+xml, ...",
  "status": "error"
}
```

#### **400 Bad Request - File Too Large**

```json
{
  "data": null,
  "message": "File too large. Max size: 2MB",
  "status": "error"
}
```

#### **401 Unauthorized**

```json
{
  "data": null,
  "message": "Unauthorized",
  "status": "error"
}
```

#### **404 Not Found - Technology Not Found**

```json
{
  "data": null,
  "message": "Technology not found",
  "status": "error"
}
```

#### **500 Internal Server Error**

```json
{
  "data": null,
  "message": "Failed to upload file",
  "status": "error"
}
```

## Usage Examples

### **cURL Example**

```bash
curl -X POST \
  http://localhost:3000/technologies/123e4567-e89b-12d3-a456-426614174000/icon \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@react-icon.png"
```

### **JavaScript/Fetch Example**

```javascript
const uploadTechnologyIcon = async (technologyId, file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/technologies/${technologyId}/icon`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
};

// Usage
const fileInput = document.getElementById('iconFile');
const file = fileInput.files[0];

uploadTechnologyIcon(
  '123e4567-e89b-12d3-a456-426614174000',
  file,
  'your-jwt-token',
)
  .then((result) => {
    if (result.status === 'success') {
      console.log('Icon uploaded:', result.data.url);
      // Update UI with new icon
      updateTechnologyIcon(result.data.url);
    } else {
      console.error('Upload failed:', result.message);
    }
  })
  .catch((error) => console.error('Error:', error));
```

### **React Component Example**

```jsx
import React, { useState } from 'react';

const TechnologyIconUpload = ({ technologyId, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, SVG, WebP)');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/technologies/${technologyId}/icon`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        onUpload(result.data);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="icon-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="file-input"
      />

      {uploading && <div className="uploading">Uploading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default TechnologyIconUpload;
```

### **HTML Form Example**

```html
<form id="iconUploadForm" enctype="multipart/form-data">
  <div>
    <label for="iconFile">Select Icon:</label>
    <input type="file" id="iconFile" name="file" accept="image/*" required />
  </div>

  <button type="submit" id="uploadBtn">Upload Icon</button>
  <div id="status"></div>
</form>

<script>
  document
    .getElementById('iconUploadForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById('iconFile');
      const file = fileInput.files[0];
      const statusDiv = document.getElementById('status');
      const uploadBtn = document.getElementById('uploadBtn');

      if (!file) {
        statusDiv.innerHTML =
          '<span style="color: red;">Please select a file</span>';
        return;
      }

      // Client-side validation
      if (file.size > 2 * 1024 * 1024) {
        statusDiv.innerHTML =
          '<span style="color: red;">File too large (max 2MB)</span>';
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        statusDiv.innerHTML =
          '<span style="color: red;">Invalid file type</span>';
        return;
      }

      uploadBtn.disabled = true;
      statusDiv.innerHTML = '<span style="color: blue;">Uploading...</span>';

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          '/technologies/123e4567-e89b-12d3-a456-426614174000/icon',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          },
        );

        const result = await response.json();

        if (result.status === 'success') {
          statusDiv.innerHTML =
            '<span style="color: green;">Icon uploaded successfully!</span>';
          // Update UI with new icon
          document.getElementById('technologyIcon').src = result.data.url;
        } else {
          statusDiv.innerHTML = `<span style="color: red;">Error: ${result.message}</span>`;
        }
      } catch (error) {
        statusDiv.innerHTML =
          '<span style="color: red;">Upload failed. Please try again.</span>';
      } finally {
        uploadBtn.disabled = false;
      }
    });
</script>
```

## File Storage Details

### **Storage Location**

Icons are stored in Supabase Storage under the `technology-icons` bucket:

```
technology-icons/
├── tech-{technology-id}/
│   ├── {timestamp}-{random}.png
│   └── {timestamp}-{random}.svg
```

### **File Naming Convention**

- **Format**: `{timestamp}-{random_string}.{extension}`
- **Example**: `1703123456789-abc123def.png`
- **Purpose**: Prevents filename conflicts and ensures uniqueness

### **Public Access**

Icons are publicly accessible via direct URLs:

```
https://your-project.supabase.co/storage/v1/object/public/technology-icons/tech-123/1703123456789-abc123.png
```

## Database Updates

When an icon is uploaded, the following fields are updated in the `technologies` table:

| Field              | Type         | Description                            |
| ------------------ | ------------ | -------------------------------------- |
| `icon_url`         | TEXT         | Public URL of the uploaded icon        |
| `icon_filename`    | VARCHAR(255) | Original filename of the uploaded file |
| `icon_size`        | BIGINT       | File size in bytes                     |
| `icon_uploaded_at` | TIMESTAMP    | Upload timestamp                       |
| `updated_at`       | TIMESTAMP    | Last update timestamp                  |

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
5. **Lazy Loading**: Load icons only when needed

### **Security Considerations**

1. **File Validation**: Always validate file type and size on both client and server
2. **Access Control**: Restrict uploads to authorized users (admin only recommended)
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Malware Scanning**: Consider scanning uploaded files for malware

## Error Handling

### **Common Error Scenarios**

1. **File Too Large**
   - Client: Check file size before upload
   - Server: Returns 400 with size limit message

2. **Invalid File Type**
   - Client: Validate MIME type before upload
   - Server: Returns 400 with allowed types list

3. **Technology Not Found**
   - Server: Returns 404 if technology ID doesn't exist

4. **Authentication Issues**
   - Server: Returns 401 for invalid/missing JWT token

5. **Storage Errors**
   - Server: Returns 500 for storage-related failures

### **Debugging Tips**

1. Check browser network tab for request/response details
2. Verify JWT token is valid and not expired
3. Test with different file types and sizes
4. Check Supabase logs for storage errors
5. Verify RLS policies are correctly configured

## API Documentation

This endpoint is fully documented in the Swagger/OpenAPI documentation available at:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

The Swagger documentation includes:

- Interactive API testing
- Request/response examples
- Schema definitions
- Error code descriptions
- File upload interface

## Related Endpoints

### **Technology Management**

- **Get Technology**: `GET /technologies/{id}`
- **Update Technology**: `PUT /technologies/{id}`
- **Delete Technology**: `DELETE /technologies/{id}`

### **File Management**

- **Upload Profile Picture**: `POST /file-upload/profile-picture`
- **Upload CV File**: `POST /file-upload/cv-file`
- **Upload Project Image**: `POST /file-upload/project-image`

## Support

For issues with this API:

1. Check the troubleshooting section above
2. Review Supabase storage setup documentation
3. Verify all configuration steps are completed
4. Test with minimal examples first
5. Check server logs for detailed error information
