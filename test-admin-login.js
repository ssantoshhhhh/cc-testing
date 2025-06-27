const axios = require('axios');

const loginData = {
  email: 'admin@campusconnect.com',
  password: 'admin123'
};

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await axios.post('http://localhost:8000/api/auth/login', loginData);
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testAdminLogin(); 