# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Repository Setup

- [ ] Code pushed to GitHub repository
- [ ] All files committed and up to date
- [ ] Repository is public or Vercel has access

### 2. Environment Variables Prepared

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- [ ] `SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `JWT_SECRET` - Your JWT secret key
- [ ] `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- [ ] `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
- [ ] `COOKIE_DOMAIN` - Your Vercel domain (e.g., your-project.vercel.app)
- [ ] `NODE_ENV` - Set to "production"

### 3. Configuration Files Verified

- [ ] `vercel.json` - Vercel configuration (points to src/main.ts)
- [ ] `src/main.ts` - Default export function for Vercel
- [ ] `package.json` - Updated with Vercel build script
- [ ] All TypeScript errors resolved

## 🏗️ Deployment Steps

### Step 1: Connect to Vercel

1. [ ] Go to [vercel.com](https://vercel.com)
2. [ ] Sign in with GitHub account
3. [ ] Click "New Project"
4. [ ] Import your GitHub repository
5. [ ] Select the repository and click "Deploy"

### Step 2: Configure Environment Variables

1. [ ] Go to Project Settings → Environment Variables
2. [ ] Add all required environment variables
3. [ ] Ensure all variables are set correctly
4. [ ] Click "Save"

### Step 3: Configure Build Settings

1. [ ] Go to Project Settings → General
2. [ ] Set Framework Preset to "Other"
3. [ ] Set Build Command to "npm run vercel-build"
4. [ ] Set Output Directory to "dist"
5. [ ] Set Install Command to "npm install"
6. [ ] Leave Root Directory empty (./)

### Step 4: Deploy

1. [ ] Click "Deploy" in Vercel dashboard
2. [ ] Wait for build to complete (2-3 minutes)
3. [ ] Check deployment logs for any errors
4. [ ] Verify deployment status is "Ready"

## 🧪 Post-Deployment Testing

### 1. Health Check Testing

- [ ] Test `/health` endpoint
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

### 2. API Endpoint Testing

- [ ] Test `/api/v1/auth/sign-up` endpoint
- [ ] Test `/api/v1/auth/sign-in` endpoint
- [ ] Test `/api/v1/auth/sign-out` endpoint
- [ ] Test `/api/v1/auth/me` endpoint

### 3. CORS Testing

- [ ] Test from frontend application
- [ ] Verify cookies are being set
- [ ] Check CORS headers are correct
- [ ] Test preflight requests

### 4. Function Testing

- [ ] Check function logs in Vercel dashboard
- [ ] Monitor execution times
- [ ] Verify no timeout errors
- [ ] Check error rates

## 🔍 Monitoring Setup

### 1. Vercel Dashboard

- [ ] Set up monitoring alerts
- [ ] Configure function logging
- [ ] Monitor deployment status
- [ ] Check performance metrics

### 2. Error Tracking

- [ ] Monitor function errors
- [ ] Check build logs
- [ ] Verify environment variables
- [ ] Test error handling

## 🚨 Troubleshooting Checklist

### Common Issues

- [ ] **Serverless Function Crashed** - Check Vercel function logs for detailed error messages
- [ ] **CORS errors** - Check ALLOWED_ORIGINS environment variable
- [ ] **Environment variables not found** - Verify in Vercel dashboard
- [ ] **Build failures** - Check build logs
- [ ] **Function timeouts** - Optimize code for faster execution
- [ ] **Cookie issues** - Check COOKIE_DOMAIN environment variable

### Debugging Steps

1. [ ] Check Vercel function logs
2. [ ] Verify environment variables
3. [ ] Test endpoints with cURL
4. [ ] Check CORS configuration
5. [ ] Monitor function performance

## 📊 Performance Optimization

### 1. Function Optimization

- [ ] Keep functions lightweight
- [ ] Use caching where possible
- [ ] Optimize database queries
- [ ] Minimize dependencies

### 2. CORS Optimization

- [ ] Only allow necessary origins
- [ ] Use specific headers
- [ ] Enable credentials only when needed

### 3. Monitoring

- [ ] Monitor function execution times
- [ ] Check error rates
- [ ] Optimize based on usage patterns

## 🎯 Final Verification

### 1. API Functionality

- [ ] All endpoints working correctly
- [ ] Authentication flow complete
- [ ] Cookie management working
- [ ] Error handling proper

### 2. Frontend Integration

- [ ] Frontend can connect to API
- [ ] CORS working correctly
- [ ] Cookies being set and read
- [ ] Authentication state managed

### 3. Production Readiness

- [ ] Environment variables secure
- [ ] Monitoring configured
- [ ] Error tracking set up
- [ ] Performance optimized

## 📞 Support Resources

- [ ] Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- [ ] NestJS Documentation: [nestjs.com](https://nestjs.com)
- [ ] Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- [ ] Function Logs: Vercel dashboard → Functions → Logs

## 🎉 Success Criteria

Your deployment is successful when:

- [ ] All API endpoints respond correctly
- [ ] Frontend can authenticate users
- [ ] Cookies are working properly
- [ ] CORS is configured correctly
- [ ] No errors in function logs
- [ ] Performance is acceptable
- [ ] Monitoring is set up

## 📝 Notes

- Keep your environment variables secure
- Monitor your deployment regularly
- Update your frontend to use the new API URL
- Test thoroughly before going live
- Set up proper error tracking and monitoring

---

**Deployment URL**: `https://your-project-name.vercel.app/api/v1`

**Health Check**: `https://your-project-name.vercel.app/health`

**Documentation**: `https://your-project-name.vercel.app/api/docs`

**Status**: ✅ Ready for Production
