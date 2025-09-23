# 🔒 Image Usage Validation - Prevent Orphaned References

## Problem

Users could delete images that are currently being used by projects or technologies, causing broken references and orphaned data.

## ✅ Solution Applied

Added comprehensive usage validation to prevent deleting images that are currently in use.

### **New Validation Logic:**

1. **Before Individual Delete**: Check if image URL is used in any project's `cover_url` or technology's `icon_url`
2. **Before Bulk Delete**: Check each image for usage before deletion
3. **Clear Error Messages**: Tell users exactly which projects/technologies are using the image

### **Implementation Details:**

#### **Individual Delete Protection:**

```typescript
// Check if image is being used by projects or technologies
await this.checkImageUsage(imageId, image[0].url);
```

#### **Bulk Delete Protection:**

```typescript
// Check if any images are being used by projects or technologies
for (const imageId of foundIds) {
  const { data: imageData } = await this.supabaseService.select('images', {
    eq: { id: imageId },
  });
  if (imageData && imageData.length > 0) {
    await this.checkImageUsage(imageId, imageData[0].url);
  }
}
```

#### **Usage Check Method:**

```typescript
private async checkImageUsage(imageId: string, imageUrl: string): Promise<void> {
  // Check projects using this image as cover_url
  const { data: projectsUsingImage } = await this.supabaseService.supabase
    .from('projects')
    .select('id, title')
    .eq('cover_url', imageUrl);

  if (projectsUsingImage && projectsUsingImage.length > 0) {
    const projectTitles = projectsUsingImage.map(p => p.title).join(', ');
    throw new BadRequestException(
      `Cannot delete image: It is currently being used as cover image for project(s): ${projectTitles}. Please remove the image from the project(s) first.`
    );
  }

  // Check technologies using this image as icon_url
  const { data: technologiesUsingImage } = await this.supabaseService.supabase
    .from('technologies')
    .select('id, name')
    .eq('icon_url', imageUrl);

  if (technologiesUsingImage && technologiesUsingImage.length > 0) {
    const technologyNames = technologiesUsingImage.map(t => t.name).join(', ');
    throw new BadRequestException(
      `Cannot delete image: It is currently being used as icon for technology/technologies: ${technologyNames}. Please remove the image from the technology/technologies first.`
    );
  }
}
```

## 🧪 Error Scenarios

### **❌ Trying to Delete Image Used by Project:**

**Request:**

```bash
DELETE /api/v1/images/7634655e-44f5-4dca-8ece-776d46851070
```

**Response:**

```json
{
  "message": "Cannot delete image: It is currently being used as cover image for project(s): My Awesome Project, Another Project. Please remove the image from the project(s) first.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### **❌ Trying to Delete Image Used by Technology:**

**Request:**

```bash
DELETE /api/v1/images/e360cc84-8fac-4931-97ae-8f9612568284
```

**Response:**

```json
{
  "message": "Cannot delete image: It is currently being used as icon for technology/technologies: React, Vue.js. Please remove the image from the technology/technologies first.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### **❌ Trying to Bulk Delete Images with Usage:**

**Request:**

```bash
DELETE /api/v1/images/bulk
{
    "image_ids": [
        "7634655e-44f5-4dca-8ece-776d46851070",  // Used by project
        "e360cc84-8fac-4931-97ae-8f9612568284"   // Used by technology
    ]
}
```

**Response:**

```json
{
  "message": "Cannot delete image: It is currently being used as cover image for project(s): My Awesome Project. Please remove the image from the project(s) first.",
  "error": "Bad Request",
  "statusCode": 400
}
```

## ✅ **Proper Workflow**

### **To Delete an Image:**

1. **First**: Remove the image from all projects/technologies
2. **Then**: Delete the image

**Step 1 - Remove from Project:**

```bash
PATCH /api/v1/projects/project-id
{
    "cover_url": null
}
```

**Step 2 - Remove from Technology:**

```bash
PATCH /api/v1/technologies/tech-id
{
    "icon_url": null
}
```

**Step 3 - Now Delete Image:**

```bash
DELETE /api/v1/images/image-id
```

## 🎯 **Benefits**

1. **Data Integrity**: Prevents broken references
2. **Clear Error Messages**: Users know exactly what to fix
3. **Prevents Orphaned Data**: No dangling image references
4. **Better UX**: Clear workflow for image management
5. **Database Consistency**: Maintains referential integrity

## 🔍 **What Gets Checked**

| Image Usage     | Table          | Column      | Error Message                                       |
| --------------- | -------------- | ----------- | --------------------------------------------------- |
| Project Cover   | `projects`     | `cover_url` | "used as cover image for project(s): [titles]"      |
| Technology Icon | `technologies` | `icon_url`  | "used as icon for technology/technologies: [names]" |

The system now prevents image deletion when they're actively being used, ensuring data integrity and providing clear guidance to users! 🎉
