const dotenv = require('dotenv');
dotenv.config({ path: './lms-backend/.env' });
const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');

const testPassword = async () => {
    try {
        await connectDB();
        await new Promise(resolve => setTimeout(resolve, 2000));
        const admin = await User.findOne({ email: 'admin@example.com' }).select('+password');
        if (admin) {
            console.log('Admin found for password test.');
            const isMatch = await admin.comparePassword('admin123');
            console.log('Password match:', isMatch);
        } else {
            console.log('Admin NOT found!');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testPassword();
