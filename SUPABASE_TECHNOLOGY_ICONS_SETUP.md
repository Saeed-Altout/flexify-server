# Supabase Storage Setup for Technology Icons

## Overview

This guide explains how to set up Supabase Storage for uploading technology icons in your Flexify application.

## Prerequisites

- Supabase project created
- Database migration scripts executed
- Environment variables configured

## Step 1: Create Storage Buckets

### 1.1 Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar

### 1.2 Create Technology Icons Bucket

1. Click **"New bucket"**
2. Configure the bucket:
   - **Name**: `technology-icons`
   - **Public**: ✅ **Yes** (for public access to icons)
   - **File size limit**: `2MB` (recommended for icons)
   - **Allowed MIME types**:
     ```
     image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml,image/avif,image/heic,image/heif,image/ico
     ```

3. Click **"Create bucket"**

### 1.3 Verify Other Required Buckets

Ensure these buckets exist (create if missing):

- `profile-pictures` (for user avatars)
- `cv-files` (for user CV files)
- `project-images` (for project images)

## Step 2: Configure Row Level Security (RLS) Policies

### 2.1 Technology Icons Bucket Policies

Navigate to **Storage** → **Policies** → **technology-icons**

#### Policy 1: Allow Public Read Access

```sql
-- Allow anyone to view technology icons
CREATE POLICY "Public read access for technology icons" ON storage.objects
FOR SELECT USING (bucket_id = 'technology-icons');
```

#### Policy 2: Allow Authenticated Users to Upload

```sql
-- Allow authenticated users to upload technology icons
CREATE POLICY "Authenticated users can upload technology icons" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'technology-icons'
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Allow Authenticated Users to Update

```sql
-- Allow authenticated users to update technology icons
CREATE POLICY "Authenticated users can update technology icons" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'technology-icons'
  AND auth.role() = 'authenticated'
);
```

#### Policy 4: Allow Authenticated Users to Delete

```sql
-- Allow authenticated users to delete technology icons
CREATE POLICY "Authenticated users can delete technology icons" ON storage.objects
FOR DELETE USING (
  bucket_id = 'technology-icons'
  AND auth.role() = 'authenticated'
);
```

### 2.2 Admin-Only Upload Policy (Optional)

If you want to restrict icon uploads to admin users only:

```sql
-- Allow only admin users to upload technology icons
CREATE POLICY "Admin users can upload technology icons" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'technology-icons'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);
```

## Step 3: Database Migration

### 3.1 Run the Technology Icons Migration

Execute the migration script in your Supabase SQL Editor:

```sql
-- File: database/12-add-technology-icons.sql
-- This adds icon-related fields to the technologies table
```

### 3.2 Verify Database Changes

Check that the following columns were added to the `technologies` table:

- `icon_url` (TEXT)
- `icon_filename` (VARCHAR(255))
- `icon_size` (BIGINT)
- `icon_uploaded_at` (TIMESTAMP WITH TIME ZONE)

## Step 4: Environment Variables

Ensure these environment variables are set in your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

## Step 5: Test the Setup

### 5.1 Test Icon Upload

Use the API endpoint to test icon upload:

```bash
curl -X POST \
  http://localhost:3000/technologies/{technology-id}/icon \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@icon.png"
```

### 5.2 Verify Storage

1. Go to **Storage** → **technology-icons** in Supabase Dashboard
2. Check that files are uploaded with the correct folder structure:
   ```
   technology-icons/
   ├── tech-{technology-id}/
   │   ├── {timestamp}-{random}.png
   │   └── ...
   ```

## Step 6: Storage Configuration Details

### 6.1 Bucket Settings

| Setting                | Value              | Description              |
| ---------------------- | ------------------ | ------------------------ |
| **Name**               | `technology-icons` | Bucket identifier        |
| **Public**             | `true`             | Icons need public access |
| **File Size Limit**    | `2MB`              | Reasonable for icons     |
| **Allowed MIME Types** | Image formats      | See list above           |

### 6.2 Folder Structure

Icons are organized by technology ID:

```
technology-icons/
├── tech-{technology-id-1}/
│   ├── 1703123456789-abc123.png
│   └── 1703123456790-def456.svg
├── tech-{technology-id-2}/
│   └── 1703123456791-ghi789.png
└── ...
```

### 6.3 File Naming Convention

- **Format**: `{timestamp}-{random}.{extension}`
- **Example**: `1703123456789-abc123.png`
- **Purpose**: Prevents filename conflicts and ensures uniqueness

## Step 7: Security Considerations

### 7.1 Access Control

- **Public Read**: Icons are publicly accessible (needed for frontend display)
- **Authenticated Upload**: Only logged-in users can upload icons
- **Admin Restriction**: Optional - restrict uploads to admin users only

### 7.2 File Validation

The API validates:

- **File Type**: Only image formats allowed
- **File Size**: Maximum 2MB per icon
- **MIME Type**: Server-side validation

### 7.3 Rate Limiting

Consider implementing rate limiting for upload endpoints to prevent abuse.

## Step 8: Monitoring and Maintenance

### 8.1 Storage Usage

Monitor storage usage in Supabase Dashboard:

- **Storage** → **Overview** → **Usage**

### 8.2 Cleanup

Implement cleanup for:

- Orphaned files (when technologies are deleted)
- Old/unused icon versions
- Files exceeding size limits

### 8.3 Backup

- Supabase automatically handles backups
- Consider additional backup strategies for critical assets

## Step 9: Frontend Integration

### 9.1 Display Icons

Use the public URLs to display icons:

```javascript
// Get technology with icon
const technology = await fetch('/api/technologies/123');
const iconUrl = technology.icon_url;

// Display in UI
<img src={iconUrl} alt={technology.name} />;
```

### 9.2 Fallback Handling

Implement fallback for missing icons:

```javascript
const IconComponent = ({ technology }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !technology.icon_url) {
    return <DefaultIcon />;
  }

  return (
    <img
      src={technology.icon_url}
      alt={technology.name}
      onError={() => setImageError(true)}
    />
  );
};
```

## Troubleshooting

### Common Issues

1. **Upload Fails with 403**
   - Check RLS policies
   - Verify user authentication
   - Ensure proper JWT token

2. **File Too Large Error**
   - Check file size (max 2MB)
   - Verify bucket file size limit

3. **Invalid File Type**
   - Check MIME type validation
   - Verify allowed file types in bucket settings

4. **CORS Issues**
   - Ensure Supabase CORS settings allow your domain
   - Check browser console for CORS errors

### Debug Steps

1. Check Supabase logs in Dashboard
2. Verify environment variables
3. Test with different file types/sizes
4. Check network requests in browser dev tools

## API Endpoints

### Upload Technology Icon

```http
POST /technologies/{id}/icon
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: (binary) Icon image file
```

### Response

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

## Next Steps

1. **Test the setup** with sample icon uploads
2. **Implement frontend** icon display components
3. **Add error handling** for upload failures
4. **Consider CDN** for better performance
5. **Monitor usage** and optimize as needed

## Support

For issues with this setup:

1. Check Supabase documentation
2. Review API logs
3. Test with minimal examples
4. Verify all configuration steps
