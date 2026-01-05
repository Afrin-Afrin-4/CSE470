const axios = require('axios');

const testRegistration = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            username: 'testuser' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            role: 'student'
        });
        console.log('Registration SUCCESS:', res.data);
    } catch (err) {
        console.error('Registration FAILED:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
};

testRegistration();
