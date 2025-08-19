# Contact Service - Portfolio Backend

A comprehensive contact service that allows users to send messages through your portfolio and enables you to reply from an admin dashboard.

## Features

- **Public Contact Form**: Users can send messages without authentication
- **Admin Dashboard**: Secure admin-only access to view and manage messages
- **Email Notifications**: Automatic email alerts for new messages
- **Reply System**: Send replies to users via email
- **Message Management**: Update status, archive, and delete messages
- **Role-Based Access Control**: Only admin users can access dashboard features
- **Comprehensive API**: RESTful endpoints with proper validation

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Contact API    │    │   Email Service │
│   (Portfolio)   │───▶│   (NestJS)       │───▶│   (SMTP)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Supabase DB    │
                       │   (PostgreSQL)   │
                       └──────────────────┘
```

## Database Schema

### Contact Messages Table

- `id`: Unique identifier (UUID)
- `name`: Sender's name
- `email`: Sender's email
- `subject`: Message subject
- `message`: Message content
- `status`: Message status (PENDING, REPLIED, ARCHIVED)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Contact Replies Table

- `id`: Unique identifier (UUID)
- `message_id`: Reference to contact message
- `admin_id`: Admin who replied
- `reply_content`: Reply content
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Send Contact Message

```http
POST /contact/send-message
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a potential project..."
}
```

### Admin-Only Endpoints (Require Authentication + Admin Role)

#### Get All Messages

```http
GET /contact/messages
Authorization: Bearer <jwt_token>
```

#### Get Message by ID

```http
GET /contact/messages/:id
Authorization: Bearer <jwt_token>
```

#### Reply to Message

```http
POST /contact/messages/:id/reply
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reply_content": "Thank you for your message. I'll get back to you soon."
}
```

#### Update Message Status

```http
PUT /contact/messages/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "ARCHIVED"
}
```

#### Delete Message

```http
DELETE /contact/messages/:id
Authorization: Bearer <jwt_token>
```

#### Get Messages by Status

```http
GET /contact/messages/status/:status
Authorization: Bearer <jwt_token>
```

#### Get Message Statistics

```http
GET /contact/stats
Authorization: Bearer <jwt_token>
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @nestjs-modules/mailer nodemailer @types/nodemailer
```

### 2. Environment Configuration

Add these variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=your_admin_email@example.com
```

### 3. Database Setup

Run the SQL script in `contact-tables.sql` in your Supabase SQL editor:

```sql
-- Execute the entire contact-tables.sql file
```

### 4. Gmail App Password Setup

For Gmail SMTP, you'll need to:

1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `SMTP_PASS`

## Usage Examples

### Frontend Integration (React)

```tsx
import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/contact/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Your Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
      />
      <textarea
        placeholder="Your Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit">Send Message</button>
    </form>
  );
};
```

### Admin Dashboard Integration

```tsx
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/contact/messages', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (messageId: string, replyContent: string) => {
    try {
      const response = await fetch(`/api/contact/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reply_content: replyContent }),
      });

      if (response.ok) {
        alert('Reply sent successfully!');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Contact Messages</h1>
      {messages.map((message) => (
        <div key={message.id} className="message-card">
          <h3>{message.subject}</h3>
          <p>
            <strong>From:</strong> {message.name} ({message.email})
          </p>
          <p>
            <strong>Status:</strong> {message.status}
          </p>
          <p>{message.message}</p>

          {message.replies && message.replies.length > 0 && (
            <div className="replies">
              <h4>Replies:</h4>
              {message.replies.map((reply) => (
                <div key={reply.id} className="reply">
                  <p>{reply.reply_content}</p>
                  <small>
                    {new Date(reply.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => sendReply(message.id, 'Thank you for your message!')}
          >
            Send Reply
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access**: Only admin users can access dashboard
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: Parameterized queries via Supabase
- **Authentication Guards**: JWT-based authentication

## Error Handling

The service includes comprehensive error handling:

- Input validation errors
- Database operation failures
- Email sending failures
- Authentication/authorization errors
- Proper HTTP status codes

## Monitoring & Logging

- Structured logging with NestJS Logger
- Email operation tracking
- Database operation monitoring
- Error tracking and reporting

## Performance Considerations

- Database indexes on frequently queried fields
- Efficient query patterns
- Connection pooling via Supabase
- Asynchronous email operations

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:cov
```

## Deployment

### Vercel

The service is ready for Vercel deployment with the existing configuration.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Troubleshooting

### Common Issues

1. **Email not sending**: Check SMTP credentials and app password
2. **Database connection**: Verify Supabase configuration
3. **Authentication errors**: Ensure JWT token is valid and user has admin role
4. **CORS issues**: Configure CORS in your NestJS app

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and checking console logs.

## Support

For issues or questions:

1. Check the logs for error details
2. Verify environment configuration
3. Test database connectivity
4. Ensure proper authentication setup

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Follow conventional commit messages
