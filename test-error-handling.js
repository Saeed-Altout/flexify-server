#!/usr/bin/env node

/**
 * Test script to verify that error handling works correctly
 */

const http = require('http');

// Function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testErrorHandling() {
  const baseUrl = 'localhost';
  const port = 3000;
  const basePath = '/api/v1/auth';

  console.log('🧪 Testing Authentication Error Handling');
  console.log('=' .repeat(50));

  // Test 1: Try to create a user
  console.log('\n1️⃣ Testing initial sign-up (should succeed if user doesn\'t exist)...');
  
  const signUpData = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123'
  };

  const signUpOptions = {
    hostname: baseUrl,
    port: port,
    path: `${basePath}/sign-up`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const firstSignUpResponse = await makeRequest(signUpOptions, signUpData);
    console.log(`   Status: ${firstSignUpResponse.statusCode}`);
    console.log(`   Response:`, JSON.stringify(firstSignUpResponse.body, null, 2));
    
    // Test 2: Try to create the same user again (should return 400 Bad Request)
    console.log('\n2️⃣ Testing duplicate sign-up (should return 400 Bad Request)...');
    
    const duplicateSignUpResponse = await makeRequest(signUpOptions, signUpData);
    console.log(`   Status: ${duplicateSignUpResponse.statusCode}`);
    console.log(`   Response:`, JSON.stringify(duplicateSignUpResponse.body, null, 2));
    
    // Verify that we get a 400 status code instead of 500
    if (duplicateSignUpResponse.statusCode === 400) {
      console.log('   ✅ SUCCESS: Got 400 Bad Request as expected!');
    } else if (duplicateSignUpResponse.statusCode === 500) {
      console.log('   ❌ FAILURE: Got 500 Internal Server Error (this is the bug we fixed)');
    } else {
      console.log(`   ⚠️  UNEXPECTED: Got status ${duplicateSignUpResponse.statusCode}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Check if the server is running
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running with: npm run start:dev');
    }
  }

  // Test 3: Test invalid sign-in (should return 401)
  console.log('\n3️⃣ Testing invalid sign-in (should return 401 Unauthorized)...');
  
  const signInData = {
    email: 'nonexistent@example.com',
    password: 'wrongpassword'
  };

  const signInOptions = {
    hostname: baseUrl,
    port: port,
    path: `${basePath}/sign-in`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const signInResponse = await makeRequest(signInOptions, signInData);
    console.log(`   Status: ${signInResponse.statusCode}`);
    console.log(`   Response:`, JSON.stringify(signInResponse.body, null, 2));
    
    if (signInResponse.statusCode === 401) {
      console.log('   ✅ SUCCESS: Got 401 Unauthorized as expected!');
    } else {
      console.log(`   ⚠️  UNEXPECTED: Got status ${signInResponse.statusCode}`);
    }
  } catch (error) {
    console.error('❌ Sign-in test failed:', error.message);
  }

  console.log('\n🏁 Error handling test completed!');
}

// Run the test
testErrorHandling().catch(console.error);

