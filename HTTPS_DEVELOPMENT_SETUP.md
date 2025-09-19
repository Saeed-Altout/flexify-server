# 🔒 HTTPS Development Setup for SameSite=None Cookies

## Why HTTPS is Required

When using `SameSite=None`, browsers require the `Secure` flag to be set, which means cookies will only be sent over HTTPS connections. This is a security requirement to prevent man-in-the-middle attacks.

## Development Setup Options

### Option 1: Use HTTPS in Development (Recommended)

#### For Node.js/NestJS Server:

1. **Generate SSL certificates for localhost:**

   ```bash
   # Install mkcert (one-time setup)
   # Windows (using Chocolatey):
   choco install mkcert

   # Or download from: https://github.com/FiloSottile/mkcert/releases

   # Install the local CA
   mkcert -install

   # Generate certificates for localhost
   mkcert localhost 127.0.0.1 ::1
   ```

2. **Update your server to use HTTPS:**

   ```typescript
   // In main.ts or server setup
   import { readFileSync } from 'fs';
   import { NestFactory } from '@nestjs/core';

   async function bootstrap() {
     const httpsOptions = {
       key: readFileSync('./localhost-key.pem'),
       cert: readFileSync('./localhost.pem'),
     };

     const app = await NestFactory.create(AppModule, { httpsOptions });
     // ... rest of your setup
   }
   ```

3. **Start your server with HTTPS:**
   ```bash
   npm run start:dev
   # Server will be available at https://localhost:3000
   ```

#### For Frontend Development:

1. **Vite (if using Vite):**

   ```bash
   # Start with HTTPS
   npm run dev -- --https
   ```

2. **Next.js:**

   ```bash
   # Add to package.json scripts
   "dev:https": "next dev --experimental-https"
   ```

3. **Create React App:**
   ```bash
   # Set HTTPS environment variable
   set HTTPS=true && npm start
   ```

### Option 2: Use a Reverse Proxy (Alternative)

#### Using nginx:

```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /path/to/localhost.pem;
    ssl_certificate_key /path/to/localhost-key.pem;

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3001/; # Your frontend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 3: Use Development Tools

#### Using ngrok (for testing):

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the HTTPS URL provided by ngrok
# Example: https://abc123.ngrok.io
```

## Testing Your Setup

1. **Check if cookies are working:**
   - Open browser dev tools
   - Go to Application/Storage tab
   - Look for `NEXT_CWS_*` cookies
   - Verify they have `SameSite=None; Secure` attributes

2. **Test cookie persistence:**
   - Sign in to your app
   - Refresh the page
   - Navigate between pages
   - Cookies should persist across all actions

## Troubleshooting

### Common Issues:

1. **Cookies not appearing:**
   - Ensure you're using HTTPS
   - Check browser console for CORS errors
   - Verify `withCredentials: true` in your API client

2. **CORS errors:**
   - Make sure your frontend origin is in the CORS allowed origins
   - Check that `credentials: true` is set in CORS config

3. **Mixed content errors:**
   - Ensure both frontend and backend use HTTPS
   - Don't mix HTTP and HTTPS

### Browser-Specific Notes:

- **Chrome/Edge:** Requires HTTPS for SameSite=None
- **Firefox:** Requires HTTPS for SameSite=None
- **Safari:** Requires HTTPS for SameSite=None
- **Development:** Some browsers allow localhost exceptions, but it's not guaranteed

## Production Considerations

In production, ensure:

- Valid SSL certificates
- Proper CORS configuration
- All origins use HTTPS
- Cookie domain is set correctly

## Quick Test

Use the provided `test-cors-cookies.html` file:

1. Serve it over HTTPS
2. Run the cookie tests
3. Verify all cookies are set and persistent

## Environment Variables

You can also set these environment variables for development:

```bash
# .env
NODE_ENV=development
HTTPS=true
SSL_CERT_PATH=./localhost.pem
SSL_KEY_PATH=./localhost-key.pem
```
