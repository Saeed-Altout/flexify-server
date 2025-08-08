# 🚀 Vercel Deployment Guide

This guide will help you deploy your Flexify Backend to Vercel with all the necessary configurations.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Set up your Supabase project
4. **Environment Variables**: Prepare your environment variables

## 🏗️ Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure all files are committed**:

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify your repository structure**:
   ```
   flexify-backend/
   ├── src/
   │   ├── main.ts
   │   ├── app.module.ts
   │   └── ...
   ├── api/
   │   └── index.ts
   ├── vercel.json
   ├── package.json
   └── README.md
   ```

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Create New Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository and click "Deploy"

### Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000

# Cookie Configuration (Production)
COOKIE_DOMAIN=your-vercel-domain.vercel.app

# Server Configuration
NODE_ENV=production
```

### Step 4: Configure Build Settings

In your Vercel project dashboard, go to **Settings** → **General** and set:

- **Framework Preset**: `Other`
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `./` (leave empty for root)

### Step 5: Deploy

1. **Click "Deploy"** in your Vercel dashboard
2. **Wait for the build** to complete (usually 2-3 minutes)
3. **Check the deployment logs** for any errors

## 🔧 Configuration Files

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["src/**/*"],
        "maxLambdaSize": "15mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/main.ts"
    },
    {
      "src": "/health",
      "dest": "src/main.ts"
    },
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### `api/index.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';

let app: INestApplication | null = null;

async function bootstrap(): Promise<INestApplication> {
  if (!app) {
    try {
      // Check for required environment variables
      const requiredEnvVars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY',
        'SUPABASE_ANON_KEY',
      ];

      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName],
      );

      if (missingVars.length > 0) {
        console.warn(
          `Missing environment variables: ${missingVars.join(', ')}. Running in development mode.`,
        );
      }

      app = await NestFactory.create(AppModule);

      // Enable CORS for Vercel
      app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || [
          'http://localhost:3000',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'Cache-Control',
          'X-API-Key',
        ],
        exposedHeaders: ['Set-Cookie'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
      });

      // Global validation pipe
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      // Global prefix
      app.setGlobalPrefix('api/v1');

      await app.init();
      console.log('✅ NestJS application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to bootstrap app:', error);
      throw error;
    }
  }
  return app;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-API-Key',
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.status(200).end();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return expressApp(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);

    // Send a more detailed error response in development
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
      error: 'Internal Server Error',
      message: isDevelopment ? errorMessage : 'Something went wrong',
      ...(isDevelopment && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    });
  }
}
```

## 🧪 Testing Your Deployment

### 1. Test Health Check

First, test the health check endpoint:

```bash
curl https://your-project-name.vercel.app/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Test API Endpoints

Your API endpoints will be available at:

- `https://your-project-name.vercel.app/api/v1/auth/sign-up`
- `https://your-project-name.vercel.app/api/v1/auth/sign-in`
- `https://your-project-name.vercel.app/api/v1/auth/sign-out`
- `https://your-project-name.vercel.app/api/v1/auth/me`

### 3. Test with cURL

```bash
# Test sign-up
curl -X POST https://your-project-name.vercel.app/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'

# Test sign-in
curl -X POST https://your-project-name.vercel.app/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Test CORS

```javascript
// Test from your frontend
fetch('https://your-project-name.vercel.app/api/v1/auth/me', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

## 🔍 Monitoring and Debugging

### 1. Check Deployment Logs

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check "Build Logs" and "Function Logs"

### 2. Monitor Function Performance

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Functions" tab
4. Monitor execution times and errors

### 3. Check Environment Variables

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Verify all variables are set correctly

## 🚨 Troubleshooting

### Common Issues

#### 1. Serverless Function Crashed

**Problem**: Function crashes with 500 error
**Solution**:

- Check Vercel function logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure Supabase credentials are valid
- Check if the application is trying to listen on a port (shouldn't in serverless)

#### 2. CORS Errors

**Problem**: Frontend can't access the API
**Solution**:

- Check `ALLOWED_ORIGINS` environment variable
- Ensure your frontend domain is included
- Test with `http://localhost:3000` for local development

#### 3. Environment Variables Not Found

**Problem**: API can't find environment variables
**Solution**:

- Double-check all environment variables are set in Vercel
- Ensure variable names match exactly
- Redeploy after adding new variables

#### 4. Build Failures

**Problem**: Deployment fails during build
**Solution**:

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

#### 5. Function Timeouts

**Problem**: API requests timeout
**Solution**:

- Optimize your code for faster execution
- Consider using caching
- Check function logs for performance issues

#### 6. Cookie Issues

**Problem**: Cookies not being set or read
**Solution**:

- Check `COOKIE_DOMAIN` environment variable
- Ensure `httpOnly: false` for frontend access
- Verify CORS credentials are enabled

### Debugging Steps

1. **Check Logs**: Always check Vercel function logs first
2. **Test Locally**: Use `vercel dev` to test locally
3. **Verify Environment**: Double-check all environment variables
4. **Test Endpoints**: Use Postman or cURL to test API endpoints
5. **Check CORS**: Ensure CORS is configured correctly

## 🔄 Updating Your Deployment

### 1. Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update API"
git push origin main
```

### 2. Manual Deployments

1. Go to Vercel dashboard
2. Click "Redeploy" on your project
3. Or use Vercel CLI:
   ```bash
   vercel --prod
   ```

### 3. Environment Variable Updates

1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Update the variables
4. Redeploy the project

## 📊 Performance Optimization

### 1. Function Optimization

- Keep functions lightweight
- Use caching where possible
- Optimize database queries
- Minimize dependencies

### 2. CORS Optimization

- Only allow necessary origins
- Use specific headers
- Enable credentials only when needed

### 3. Monitoring

- Monitor function execution times
- Check error rates
- Optimize based on usage patterns

## 🎯 Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Build settings configured
- [ ] Deployment successful
- [ ] Health check endpoint working
- [ ] API endpoints tested
- [ ] CORS working correctly
- [ ] Cookies functioning
- [ ] Frontend integration tested
- [ ] Monitoring set up

## 📞 Support

If you encounter issues:

1. **Check Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Check NestJS Documentation**: [nestjs.com](https://nestjs.com)
3. **Check Function Logs**: Vercel dashboard → Functions → Logs
4. **Community Support**: [Vercel Community](https://github.com/vercel/vercel/discussions)

## 🎉 Congratulations!

Your Flexify Backend is now successfully deployed on Vercel!

Your API is available at: `https://your-project-name.vercel.app/api/v1`

Remember to:

- Update your frontend to use the new API URL
- Monitor your deployment for any issues
- Set up proper monitoring and alerting
- Keep your environment variables secure
