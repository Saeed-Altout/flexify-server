# Arduino Control API

This API provides comprehensive control over Arduino devices with real-time status monitoring, command execution, and historical tracking.

## Features

- **Device Control**: Turn Arduino devices on/off
- **Command Execution**: Send specific commands with timing
- **Status Monitoring**: Real-time device connection and status
- **Command History**: Track all executed commands
- **Authentication**: Secure endpoints with JWT authentication
- **Supabase Integration**: Persistent storage and real-time updates

## API Endpoints

### Base URL

```
http://localhost:3000/arduino
```

### Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Run Device

**POST** `/arduino/run`

Turns on the Arduino device and sets it to online status.

**Request Body:**

```json
{
  "command": "on"
}
```

**Response:**

```json
{
  "id": "uuid",
  "device_id": "uuid",
  "command_type": "on",
  "command": "on",
  "time_minutes": null,
  "status": "completed",
  "executed_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 2. Send Command

**POST** `/arduino/send-command`

Sends a specific command to the Arduino device with optional timing.

**Request Body:**

```json
{
  "command": "off",
  "time": 5
}
```

**Available Commands:**

- `"off"` - Turn off
- `"bottom"` - Control bottom component
- `"top"` - Control top component
- `"both"` - Control both components

**Response:**

```json
{
  "id": "uuid",
  "device_id": "uuid",
  "command_type": "send",
  "command": "off",
  "time_minutes": 5,
  "status": "executing",
  "executed_at": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3. Stop Device

**POST** `/arduino/stop`

Turns off the Arduino device and sets it to offline status.

**Request Body:**

```json
{
  "command": "off"
}
```

**Response:**

```json
{
  "id": "uuid",
  "device_id": "uuid",
  "command_type": "off",
  "command": "off",
  "time_minutes": null,
  "status": "completed",
  "executed_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 4. Get Device Status

**GET** `/arduino/status`

Retrieves the current status and connection information of the Arduino device.

**Response:**

```json
{
  "id": "uuid",
  "device_name": "Main Arduino",
  "device_type": "Arduino Uno",
  "is_connected": true,
  "last_seen": "2024-01-01T00:00:00Z",
  "status": "online",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 5. Check Connection

**GET** `/arduino/connected`

Quick check to see if the Arduino device is connected.

**Response:**

```json
{
  "connected": true,
  "status": "online"
}
```

### 6. Get Command History

**GET** `/arduino/history?limit=10`

Retrieves the command history for the Arduino device.

**Query Parameters:**

- `limit` (optional): Number of commands to retrieve (default: 10)

**Response:**

```json
[
  {
    "id": "uuid",
    "device_id": "uuid",
    "command_type": "on",
    "command": "on",
    "time_minutes": null,
    "status": "completed",
    "executed_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 7. Update Connection Status (Admin Only)

**POST** `/arduino/heartbeat`

Updates the Arduino device connection status (used for heartbeat monitoring).

**Request Body:**

```json
{
  "connected": true
}
```

**Response:**

```json
{
  "message": "Connection status updated to connected"
}
```

## Database Schema

### Tables

#### `arduino_devices`

- `id`: UUID (Primary Key)
- `device_name`: VARCHAR(100)
- `device_type`: VARCHAR(50)
- `is_connected`: BOOLEAN
- `last_seen`: TIMESTAMP
- `status`: VARCHAR(50)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### `arduino_commands`

- `id`: UUID (Primary Key)
- `device_id`: UUID (Foreign Key)
- `command_type`: VARCHAR(50)
- `command`: VARCHAR(100)
- `time_minutes`: INTEGER
- `status`: VARCHAR(50)
- `executed_at`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### `arduino_command_history`

- `id`: UUID (Primary Key)
- `device_id`: UUID (Foreign Key)
- `command_id`: UUID (Foreign Key)
- `command_type`: VARCHAR(50)
- `command`: VARCHAR(100)
- `time_minutes`: INTEGER
- `status`: VARCHAR(50)
- `executed_at`: TIMESTAMP
- `response_message`: TEXT
- `created_at`: TIMESTAMP

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the necessary tables:

```bash
# Execute the SQL file in your Supabase project
psql -h your-supabase-host -U your-username -d your-database -f assets/arduino-tables.sql
```

### 2. Environment Variables

Ensure your `.env` file contains the necessary Supabase configuration:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### 3. Start the Application

```bash
npm run start:dev
```

## Usage Examples

### Using cURL

#### Run Device

```bash
curl -X POST http://localhost:3000/arduino/run \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "on"}'
```

#### Send Command

```bash
curl -X POST http://localhost:3000/arduino/send-command \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "off", "time": 10}'
```

#### Get Status

```bash
curl -X GET http://localhost:3000/arduino/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/arduino';
const TOKEN = 'your_jwt_token';

// Run device
const runDevice = async () => {
  try {
    const response = await axios.post(
      `${API_BASE}/run`,
      { command: 'on' },
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );
    console.log('Device started:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Send command
const sendCommand = async () => {
  try {
    const response = await axios.post(
      `${API_BASE}/send-command`,
      { command: 'off', time: 5 },
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );
    console.log('Command sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Get status
const getStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE}/status`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    console.log('Status:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (device not found)
- `500`: Internal Server Error

## Security Features

- **JWT Authentication**: All endpoints require valid authentication
- **Role-based Access**: Admin-only endpoints for sensitive operations
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: Parameterized queries through Supabase
- **Row Level Security**: Database-level access control

## Testing

Use the provided Postman collection (`Arduino_API_Postman_Collection.json`) to test all endpoints:

1. Import the collection into Postman
2. Set your environment variables:
   - `base_url`: Your API base URL
   - `auth_token`: Your JWT authentication token
   - `admin_token`: Your admin JWT token
3. Test each endpoint with appropriate data

## Future Enhancements

- **Real-time Communication**: WebSocket support for live Arduino communication
- **Device Management**: Support for multiple Arduino devices
- **Scheduling**: Advanced command scheduling and automation
- **Analytics**: Command execution analytics and reporting
- **Mobile App**: React Native mobile application for Arduino control

## Support

For issues or questions, please refer to the main project documentation or create an issue in the project repository.
