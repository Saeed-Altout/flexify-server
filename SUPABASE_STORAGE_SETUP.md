# Supabase Storage Setup Guide for Avatar and CV File Uploads

This guide will walk you through setting up Supabase storage for user avatars and CV file uploads in your Flexify server.

## Prerequisites

- Supabase project created
- Supabase service role key available
- Database already set up with user tables

## Step 1: Create Storage Buckets

### 1.1 Access Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar

### 1.2 Create Required Buckets

Create the following storage buckets:

1. **profile-pictures** - For user avatar images
2. **cv-files** - For CV/resume documents
3. **project-images** - For project images (already exists)

### 1.3 Configure Bucket Settings

For each bucket:

- Set **Public** to `false` (we'll use RLS policies)
- Set appropriate file size limits
- Configure allowed file types

## Step 2: Set Up Row Level Security (RLS) Policies

### 2.1 Profile Pictures Bucket Policies

Run the following SQL in your Supabase SQL Editor:

```sql
-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'profile-pictures'
);

-- Allow users to view their own profile pictures
CREATE POLICY "Users can view their own profile pictures" ON storage.objects
FOR SELECT USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'profile-pictures'
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'profile-pictures'
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'profile-pictures'
);
```

### 2.2 CV Files Bucket Policies

```sql
-- Allow authenticated users to upload their own CV files
CREATE POLICY "Users can upload their own CV files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'cv-files'
);

-- Allow users to view their own CV files
CREATE POLICY "Users can view their own CV files" ON storage.objects
FOR SELECT USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'cv-files'
);

-- Allow users to update their own CV files
CREATE POLICY "Users can update their own CV files" ON storage.objects
FOR UPDATE USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'cv-files'
);

-- Allow users to delete their own CV files
CREATE POLICY "Users can delete their own CV files" ON storage.objects
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'cv-files'
);
```

## Step 3: Update Database Schema

### 3.1 Run Database Migration

Execute the database migration script to add CV file fields:

```bash
# Run the migration script in your Supabase SQL Editor
# File: database/09-add-cv-fields.sql
```

This will add the following fields to your `users` table:

- `cv_file_url` (TEXT) - URL of the uploaded CV file
- `cv_file_name` (VARCHAR(255)) - Original filename
- `cv_file_size` (BIGINT) - File size in bytes
- `cv_uploaded_at` (TIMESTAMP) - Upload timestamp

## Step 4: Environment Configuration

### 4.1 Update Environment Variables

Ensure your `.env` file includes the following Supabase configuration:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Storage bucket names (defaults are already set in code)
SUPABASE_STORAGE_BUCKET_PROFILE_PICTURES=profile-pictures
SUPABASE_STORAGE_BUCKET_CV_FILES=cv-files
SUPABASE_STORAGE_BUCKET_PROJECT_IMAGES=project-images
```

## Step 5: API Endpoints

### 5.1 Available Endpoints

#### Upload Profile Picture

```http
POST /file-upload/profile-picture
Content-Type: multipart/form-data
Authorization: Bearer <your-jwt-token>

Body:
- file: (binary) Image file (JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, max 5MB)
```

#### Upload CV File

```http
POST /file-upload/cv-file
Content-Type: multipart/form-data
Authorization: Bearer <your-jwt-token>

Body:
- file: (binary) CV file (PDF, DOC, DOCX, TXT, RTF, max 5MB)
```

#### Upload Project Image

```http
POST /file-upload/project-image
Content-Type: multipart/form-data
Authorization: Bearer <your-jwt-token>

Body:
- file: (binary) Image file (JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, max 10MB)
- projectId: (optional) Project ID for organization
```

### 5.2 Response Format

All upload endpoints return the same response format:

```json
{
  "data": {
    "url": "https://your-project.supabase.co/storage/v1/object/public/bucket-name/path/filename.ext",
    "path": "user-123/filename.ext",
    "filename": "1234567890-abc123.ext"
  },
  "message": "File uploaded successfully",
  "status": "success"
}
```

## Step 6: File Organization Structure

### 6.1 Storage Structure

Files are organized in the following structure:

```
profile-pictures/
├── user-{user-id}/
│   └── {timestamp}-{random}.{extension}

cv-files/
├── user-{user-id}/
│   └── {timestamp}-{random}.{extension}

project-images/
├── user-{user-id}/
│   ├── {timestamp}-{random}.{extension}
│   └── project-{project-id}/
│       └── {timestamp}-{random}.{extension}
```

### 6.2 File Naming Convention

- **Format**: `{timestamp}-{random-string}.{extension}`
- **Timestamp**: Unix timestamp in milliseconds
- **Random**: 6-character random string
- **Extension**: Original file extension

## Step 7: Security Considerations

### 7.1 File Validation

- **Profile Pictures**: Images only, max 5MB
- **CV Files**: Documents only (PDF, DOC, DOCX, TXT, RTF), max 5MB
- **Project Images**: Images only, max 10MB

### 7.2 Access Control

- Users can only access their own files
- RLS policies enforce user isolation
- Service role key used for server-side operations

### 7.3 File Cleanup

Consider implementing:

- Automatic cleanup of old files
- File size monitoring
- Regular security audits

## Step 8: Testing

### 8.1 Test Upload Endpoints

Use the provided Postman collection or test with curl:

```bash
# Test profile picture upload
curl -X POST \
  http://localhost:3000/file-upload/profile-picture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Test CV file upload
curl -X POST \
  http://localhost:3000/file-upload/cv-file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

### 8.2 Verify Database Updates

Check that user records are updated with file URLs:

```sql
SELECT id, email, avatar_url, cv_file_url, cv_file_name, cv_uploaded_at
FROM users
WHERE id = 'your-user-id';
```

## Step 9: Frontend Integration

### 9.1 Upload Form Example

```html
<!-- Profile Picture Upload -->
<form enctype="multipart/form-data">
  <input type="file" name="file" accept="image/*" />
  <button type="submit">Upload Avatar</button>
</form>

<!-- CV File Upload -->
<form enctype="multipart/form-data">
  <input type="file" name="file" accept=".pdf,.doc,.docx,.txt,.rtf" />
  <button type="submit">Upload CV</button>
</form>
```

### 9.2 JavaScript Upload Example

```javascript
const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/file-upload/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
};
```

## Troubleshooting

### Common Issues

1. **Upload fails with 401 Unauthorized**
   - Check JWT token validity
   - Verify user is authenticated

2. **File too large error**
   - Check file size limits
   - Verify file type is allowed

3. **Database update fails**
   - Check Supabase service key
   - Verify database connection

4. **RLS policy errors**
   - Ensure policies are correctly configured
   - Check user authentication in Supabase

### Debug Steps

1. Check server logs for detailed error messages
2. Verify Supabase configuration
3. Test with smaller files first
4. Check network connectivity to Supabase

## Support

For additional help:

- Check Supabase documentation
- Review NestJS file upload documentation
- Check server logs for detailed error messages
