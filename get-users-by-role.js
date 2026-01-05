const mongoose = require('mongoose');
const User = require('./User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/intellilearn');

async function getUsersByRole() {
  try {
    console.log('Connecting to database...');
    
    // Wait for database connection
    await new Promise((resolve, reject) => {
      mongoose.connection.on('connected', resolve);
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    console.log('Connected to database\n');
    
    // Get one user from each role
    const student = await User.findOne({ role: 'student' });
    const instructor = await User.findOne({ role: 'instructor' });
    const admin = await User.findOne({ role: 'admin' });
    
    console.log('Users by Role:');
    console.log('===============\n');
    
    if (student) {
      console.log('Student:');
      console.log(`  Name: ${student.name}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Role: ${student.role}\n`);
    } else {
      console.log('Student: None found\n');
    }
    
    if (instructor) {
      console.log('Instructor:');
      console.log(`  Name: ${instructor.name}`);
      console.log(`  Email: ${instructor.email}`);
      console.log(`  Role: ${instructor.role}\n`);
    } else {
      console.log('Instructor: None found\n');
    }
    
    if (admin) {
      console.log('Admin:');
      console.log(`  Name: ${admin.name}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role: ${admin.role}\n`);
    } else {
      console.log('Admin: None found\n');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error fetching users:', error);
    mongoose.connection.close();
  }
}

getUsersByRole();