const dotenv = require('dotenv');
dotenv.config({ path: './lms-backend/.env' });
const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');

const checkUser = async () => {
    try {
        await connectDB();
        await new Promise(resolve => setTimeout(resolve, 2000));
        const email = 'sajjadahmedshihab@gmail.com';
        const user = await User.findOne({ email }).select('+password');
        if (user) {
            console.log('USER_FOUND:', user.email);
            console.log('Username:', user.username);
            console.log('Password Hash in DB:', user.password);
        } else {
            console.log('USER_NOT_FOUND: No user found with email ' + email);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
