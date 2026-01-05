const dotenv = require('dotenv');
dotenv.config({ path: './lms-backend/.env' });
const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');

const verifyAdmin = async () => {
    try {
        await connectDB();
        await new Promise(resolve => setTimeout(resolve, 2000));
        const admin = await User.findOne({ email: 'admin@example.com' });
        if (admin) {
            console.log('Admin found:');
            console.log('ID:', admin._id);
            console.log('Role:', admin.role);
            console.log('Email:', admin.email);
        } else {
            console.log('Admin NOT found!');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyAdmin();
