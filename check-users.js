const connectDB = require('./lms-backend/config/db');
const User = require('./lms-backend/models/User');

// Connect to MongoDB using the same method as the backend server
connectDB();

const checkUsers = async () => {
  try {
    // Wait a bit for the connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} user(s) in the database:`);
      users.forEach(user => {
        console.log(`- ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
};

checkUsers();