const dotenv = require('dotenv');
dotenv.config({ path: './lms-backend/.env' });
const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB using the same method as the backend server
connectDB();

const createAdminUser = async () => {
  try {
    // Wait a bit for the connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find if this specific admin exists
    let adminUser = await User.findOne({ email: 'admin@example.com' });

    if (adminUser) {
      console.log('Admin user admin@example.com already exists. Updating password...');
      adminUser.password = 'admin123';
      adminUser.role = 'admin';
      await adminUser.save();
    } else {
      console.log('Creating new admin user: admin@example.com');
      adminUser = new User({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
    }

    console.log('Admin credentials ready!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();