const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 Testing API Endpoints...\n');

const testEndpoint = async (url, method = 'GET') => {
  try {
    const response = await fetch(url, { method });
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${method} ${url}`);
      console.log('   Status:', response.status);
      console.log('   Response:', JSON.stringify(data).substring(0, 100) + '...');
    } else {
      console.log(`❌ ${method} ${url}`);
      console.log('   Status:', response.status);
      console.log('   Error:', data.error || data.message);
    }
  } catch (error) {
    console.log(`❌ ${method} ${url}`);
    console.log('   Error:', error.message);
  }
  console.log('');
};

const runTests = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('Testing endpoints...\n');
  
  await testEndpoint(`${baseURL}/health`);
  await testEndpoint(`${baseURL}/members`);
  await testEndpoint(`${baseURL}/transactions`);
  await testEndpoint(`${baseURL}/attendance`);
  
  console.log('✨ API tests complete!');
  process.exit(0);
};

// Wait a bit for server to start
setTimeout(runTests, 1000);
