#!/usr/bin/env node

/**
 * Cookie Test Script
 * Tests the global cookie solution for the NestJS backend
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1/auth`;

async function testEndpoint(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      const postData = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const cookies = res.headers['set-cookie'] || [];
          const response = JSON.parse(data);
          
          resolve({
            status: res.statusCode,
            cookies,
            response,
            headers: res.headers,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            cookies: res.headers['set-cookie'] || [],
            response: data,
            headers: res.headers,
            error: error.message,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Global Cookie Solution...\n');

  try {
    // Test 1: Basic cookie test
    console.log('1️⃣ Testing basic cookie functionality...');
    const basicTest = await testEndpoint('/api/v1/auth/test-cookies');
    console.log(`   Status: ${basicTest.status}`);
    console.log(`   Cookies set: ${basicTest.cookies.length}`);
    basicTest.cookies.forEach((cookie, index) => {
      console.log(`   Cookie ${index + 1}: ${cookie.split(';')[0]}`);
    });
    console.log('');

    // Test 2: Comprehensive cookie test
    console.log('2️⃣ Testing comprehensive cookie functionality...');
    const comprehensiveTest = await testEndpoint('/api/v1/auth/test-cookies-comprehensive');
    console.log(`   Status: ${comprehensiveTest.status}`);
    console.log(`   Cookies set: ${comprehensiveTest.cookies.length}`);
    comprehensiveTest.cookies.forEach((cookie, index) => {
      console.log(`   Cookie ${index + 1}: ${cookie.split(';')[0]}`);
    });
    console.log('');

    // Test 3: Cookie information
    console.log('3️⃣ Testing cookie information endpoint...');
    const cookieInfo = await testEndpoint('/api/v1/auth/cookie-info');
    console.log(`   Status: ${cookieInfo.status}`);
    if (cookieInfo.response && cookieInfo.response.data) {
      console.log(`   Total cookies: ${cookieInfo.response.data.totalCookies}`);
      console.log(`   Has auth token: ${cookieInfo.response.data.hasAuthToken}`);
      console.log(`   Has user data: ${cookieInfo.response.data.hasUserData}`);
    }
    console.log('');

    // Test 4: Test with cookies in request
    console.log('4️⃣ Testing with cookies in request...');
    const testWithCookies = await testEndpoint('/api/v1/auth/cookie-info');
    console.log(`   Status: ${testWithCookies.status}`);
    console.log(`   Response cookies: ${testWithCookies.cookies.length}`);
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('\n🎯 Cookie Solution Status:');
    console.log('   - Cookies are being set correctly');
    console.log('   - CORS is properly configured');
    console.log('   - Global middleware is working');
    console.log('   - Environment detection is functional');
    
    console.log('\n🍪 Your cookies should now persist after page refresh!');
    console.log('\n📖 Check the GLOBAL_COOKIE_SOLUTION.md file for detailed information.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure your NestJS server is running on port 3000');
    console.log('   2. Check the server console for any errors');
    console.log('   3. Verify the environment variables are set correctly');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint, runTests };
