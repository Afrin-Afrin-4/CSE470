const mongoose = require('mongoose');
const User = require('./lms-backend/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/intellilearn');

async function checkAdminUser() {
  try {
    console.log('Connecting to database...');
    
    // Wait for database connection
    await new Promise((resolve, reject) => {
      mongoose.connection.on('connected', resolve);
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    console.log('Connected to database\n');
    
    // Check if admin user exists
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    } else {
      console.log('❌ No admin user found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking admin user:', error);
    mongoose.connection.close();
  }
}

checkAdminUser();