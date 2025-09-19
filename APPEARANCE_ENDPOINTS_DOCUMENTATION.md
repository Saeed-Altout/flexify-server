# Appearance Settings API Documentation

## Overview

The Appearance Settings API allows users to customize their application appearance and preferences including theme, timezone, language, and date/time formats.

## Endpoints

### **1. Get Appearance Settings**

```http
GET /appearance/settings
```

**Description**: Retrieve current user's appearance settings.

**Authentication**: Required (JWT token)

**Response**:

```json
{
  "data": {
    "theme": "dark",
    "timezone": "America/New_York",
    "time_format": "12",
    "language": "en",
    "date_format": "MM/DD/YYYY"
  },
  "message": "Appearance settings retrieved successfully",
  "status": "success"
}
```

### **2. Update Appearance Settings**

```http
PUT /appearance/settings
```

**Description**: Update user's appearance settings.

**Authentication**: Required (JWT token)

**Request Body**:

```json
{
  "theme": "dark",
  "timezone": "Europe/London",
  "time_format": "24",
  "language": "ar",
  "date_format": "DD/MM/YYYY"
}
```

**Field Descriptions**:

| Field         | Type   | Required | Description            | Valid Values                                                         |
| ------------- | ------ | -------- | ---------------------- | -------------------------------------------------------------------- |
| `theme`       | string | No       | User theme preference  | `light`, `dark`, `system`                                            |
| `timezone`    | string | No       | User timezone          | Valid IANA timezone (e.g., `UTC`, `America/New_York`)                |
| `time_format` | string | No       | Time format preference | `12`, `24`                                                           |
| `language`    | string | No       | Language preference    | `en`, `es`, `fr`, `de`, `it`, `pt`, `ru`, `zh`, `ja`, `ko`           |
| `date_format` | string | No       | Date format preference | `MM/DD/YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MM-YYYY`, `MM-DD-YYYY` |

**Response**:

```json
{
  "data": {
    "theme": "dark",
    "timezone": "Europe/London",
    "time_format": "24",
    "language": "ar",
    "date_format": "DD/MM/YYYY"
  },
  "message": "Appearance settings updated successfully",
  "status": "success"
}
```

### **3. Reset Appearance Settings**

```http
POST /appearance/settings/reset
```

**Description**: Reset appearance settings to default values.

**Authentication**: Required (JWT token)

**Response**:

```json
{
  "data": {
    "theme": "system",
    "timezone": "UTC",
    "time_format": "12",
    "language": "en",
    "date_format": "MM/DD/YYYY"
  },
  "message": "Appearance settings reset to defaults successfully",
  "status": "success"
}
```

### **4. Get Appearance Options**

```http
GET /appearance/options
```

**Description**: Get available options for appearance settings.

**Authentication**: Required (JWT token)

**Response**:

```json
{
  "data": {
    "themes": [
      { "value": "light", "label": "Light" },
      { "value": "dark", "label": "Dark" },
      { "value": "system", "label": "System" }
    ],
    "timezones": [
      { "value": "UTC", "label": "UTC (Coordinated Universal Time)" },
      { "value": "America/New_York", "label": "America/New_York (EST/EDT)" },
      { "value": "Europe/London", "label": "Europe/London (GMT/BST)" }
    ],
    "timeFormats": [
      { "value": "12", "label": "12-hour (AM/PM)" },
      { "value": "24", "label": "24-hour" }
    ],
    "languages": [
      { "value": "en", "label": "English" },
      { "value": "es", "label": "Español" },
      { "value": "fr", "label": "Français" }
    ],
    "dateFormats": [
      { "value": "MM/DD/YYYY", "label": "MM/DD/YYYY" },
      { "value": "DD/MM/YYYY", "label": "DD/MM/YYYY" },
      { "value": "YYYY-MM-DD", "label": "YYYY-MM-DD" }
    ]
  },
  "message": "Appearance options retrieved successfully",
  "status": "success"
}
```

## Usage Examples

### **JavaScript/Fetch Examples**

#### Get Current Settings

```javascript
const getAppearanceSettings = async (token) => {
  const response = await fetch('/appearance/settings', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};
```

#### Update Settings

```javascript
const updateAppearanceSettings = async (settings, token) => {
  const response = await fetch('/appearance/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  return await response.json();
};

// Usage
const settings = {
  theme: 'dark',
  timezone: 'Europe/London',
  time_format: '24',
  language: 'es',
  date_format: 'DD/MM/YYYY',
};

updateAppearanceSettings(settings, 'your-jwt-token')
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

#### Reset Settings

```javascript
const resetAppearanceSettings = async (token) => {
  const response = await fetch('/appearance/settings/reset', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};
```

#### Get Available Options

```javascript
const getAppearanceOptions = async (token) => {
  const response = await fetch('/appearance/options', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};
```

### **HTML Form Example**

```html
<form id="appearanceForm">
  <div>
    <label for="theme">Theme:</label>
    <select id="theme" name="theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  </div>

  <div>
    <label for="timezone">Timezone:</label>
    <select id="timezone" name="timezone">
      <option value="UTC">UTC (Coordinated Universal Time)</option>
      <option value="America/New_York">America/New_York (EST/EDT)</option>
      <option value="Europe/London">Europe/London (GMT/BST)</option>
    </select>
  </div>

  <div>
    <label for="time_format">Time Format:</label>
    <select id="time_format" name="time_format">
      <option value="12">12-hour (AM/PM)</option>
      <option value="24">24-hour</option>
    </select>
  </div>

  <div>
    <label for="language">Language:</label>
    <select id="language" name="language">
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  </div>

  <div>
    <label for="date_format">Date Format:</label>
    <select id="date_format" name="date_format">
      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
    </select>
  </div>

  <button type="submit">Update Settings</button>
  <button type="button" id="resetBtn">Reset to Defaults</button>
</form>

<script>
  document
    .getElementById('appearanceForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const settings = {
        theme: formData.get('theme'),
        timezone: formData.get('timezone'),
        time_format: formData.get('time_format'),
        language: formData.get('language'),
        date_format: formData.get('date_format'),
      };

      try {
        const response = await fetch('/appearance/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(settings),
        });

        const result = await response.json();

        if (result.status === 'success') {
          alert('Appearance settings updated successfully!');
          // Apply settings to UI
          applyAppearanceSettings(result.data);
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error updating appearance settings:', error);
        alert('An error occurred while updating settings');
      }
    });

  document.getElementById('resetBtn').addEventListener('click', async () => {
    if (
      confirm(
        'Are you sure you want to reset all appearance settings to defaults?',
      )
    ) {
      try {
        const response = await fetch('/appearance/settings/reset', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const result = await response.json();

        if (result.status === 'success') {
          alert('Appearance settings reset to defaults!');
          // Reload form with default values
          loadAppearanceSettings();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error resetting appearance settings:', error);
        alert('An error occurred while resetting settings');
      }
    }
  });

  // Helper function to apply settings to UI
  function applyAppearanceSettings(settings) {
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme);

    // Update form values
    document.getElementById('theme').value = settings.theme;
    document.getElementById('timezone').value = settings.timezone;
    document.getElementById('time_format').value = settings.time_format;
    document.getElementById('language').value = settings.language;
    document.getElementById('date_format').value = settings.date_format;
  }

  // Load current settings on page load
  async function loadAppearanceSettings() {
    try {
      const response = await fetch('/appearance/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (result.status === 'success') {
        applyAppearanceSettings(result.data);
      }
    } catch (error) {
      console.error('Error loading appearance settings:', error);
    }
  }

  // Load settings when page loads
  loadAppearanceSettings();
</script>
```

## Error Responses

### **400 Bad Request - Invalid Input**

```json
{
  "data": null,
  "message": "Invalid timezone. Must be one of: UTC, America/New_York, ...",
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
  "message": "User not found",
  "status": "error"
}
```

## Default Values

When a user is created or settings are reset, the following default values are applied:

- **Theme**: `system` (follows system preference)
- **Timezone**: `UTC`
- **Time Format**: `12` (12-hour with AM/PM)
- **Language**: `en` (English)
- **Date Format**: `MM/DD/YYYY`

## Supported Values

### **Themes**

- `light` - Light theme
- `dark` - Dark theme
- `system` - Follows system preference

### **Timezones**

- `UTC` - Coordinated Universal Time
- `America/New_York` - Eastern Time (EST/EDT)
- `America/Chicago` - Central Time (CST/CDT)
- `America/Denver` - Mountain Time (MST/MDT)
- `America/Los_Angeles` - Pacific Time (PST/PDT)
- `Europe/London` - Greenwich Mean Time (GMT/BST)
- `Europe/Paris` - Central European Time (CET/CEST)
- `Europe/Berlin` - Central European Time (CET/CEST)
- `Asia/Tokyo` - Japan Standard Time (JST)
- `Asia/Shanghai` - China Standard Time (CST)
- `Asia/Kolkata` - India Standard Time (IST)
- `Australia/Sydney` - Australian Eastern Time (AEST/AEDT)

### **Time Formats**

- `12` - 12-hour format with AM/PM
- `24` - 24-hour format

### **Languages**

- `en` - English
- `es` - Español
- `fr` - Français
- `de` - Deutsch
- `it` - Italiano
- `pt` - Português
- `ru` - Русский
- `zh` - 中文
- `ja` - 日本語
- `ko` - 한국어

### **Date Formats**

- `MM/DD/YYYY` - Month/Day/Year (US format)
- `DD/MM/YYYY` - Day/Month/Year (European format)
- `YYYY-MM-DD` - Year-Month-Day (ISO format)
- `DD-MM-YYYY` - Day-Month-Year
- `MM-DD-YYYY` - Month-Day-Year

## Best Practices

### **Frontend Implementation**

1. **Load settings on app initialization** to apply user preferences immediately
2. **Cache settings locally** to avoid repeated API calls
3. **Apply theme changes instantly** without requiring page reload
4. **Validate timezone selection** against supported timezones
5. **Provide visual feedback** when settings are being saved

### **Backend Security**

1. **Validate all input values** against allowed options
2. **Sanitize timezone strings** to prevent injection attacks
3. **Log setting changes** for audit purposes
4. **Use database constraints** to ensure data integrity
5. **Provide meaningful error messages** for invalid inputs

## API Documentation

This API is fully documented in the Swagger/OpenAPI documentation available at:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

The Swagger documentation includes:

- Interactive API testing
- Request/response examples
- Schema definitions
- Error code descriptions
- Validation rules
