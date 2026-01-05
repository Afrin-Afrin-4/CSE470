const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB using the same method as the backend server
connectDB();

const resetTestPasswords = async () => {
  try {
    // Wait a bit for the connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Define test users with known passwords
    const testUsers = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'instructor@example.com',
        password: 'instructor123',
        role: 'instructor'
      },
      {
        email: 'student@example.com',
        password: 'student123',
        role: 'student'
      }
    ];

    for (const userData of testUsers) {
      // Find and update the user's password
      const user = await User.findOne({ email: userData.email });
      if (user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user.password = hashedPassword;
        await user.save();
        
        console.log(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} user password updated!`);
        console.log(`Email: ${userData.email}`);
        console.log(`New Password: ${userData.password}`);
        console.log('');
      } else {
        console.log(`User not found: ${userData.email}`);
        
        // Create the user if it doesn't exist
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({
          name: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} User`,
          username: userData.role,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        });
        
        await newUser.save();
        
        console.log(`${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} user created successfully!`);
        console.log(`Email: ${userData.email}`);
        console.log(`Password: ${userData.password}`);
        console.log('');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting test passwords:', error);
    process.exit(1);
  }
};

resetTestPasswords();