const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB using the same method as the backend server
connectDB();

const createTestUsers = async () => {
  try {
    // Wait a bit for the connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create test users for each role
    const testUsers = [
      {
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Instructor User',
        username: 'instructor',
        email: 'instructor@example.com',
        password: 'instructor123',
        role: 'instructor'
      },
      {
        name: 'Student User',
        username: 'student',
        email: 'student@example.com',
        password: 'student123',
        role: 'student'
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} user already exists: ${userData.email}`);
        continue;
      }

      // Create a new user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });

      await user.save();
      
      console.log(`${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} user created successfully!`);
      console.log(`Email: ${userData.email}`);
      console.log(`Password: ${userData.password}`);
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();