const dotenv = require('dotenv');
dotenv.config({ path: './lms-backend/.env' });
const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');

const checkUser = async () => {
    try {
        await connectDB();
        await new Promise(resolve => setTimeout(resolve, 2000));
        const user = await User.findOne({
            $or: [
                { email: 'abcd@gmail.com' },
                { username: 'abcd' }
            ]
        });
        if (user) {
            console.log('USER_EXISTS: User with email abcd@gmail.com or username abcd already exists!');
            console.log('User details:', user);
        } else {
            console.log('USER_AVAILABLE: No user found with those credentials.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
