const axios = require('axios');

const testLogin = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'sajjadahmedshihab@gmail.com',
            password: '12345678'
        });
        console.log('Login Result:', res.data.email, 'Logged in successfully!');
    } catch (err) {
        console.log('Login Failed:', err.response ? err.response.data : err.message);
    }
};

testLogin();
