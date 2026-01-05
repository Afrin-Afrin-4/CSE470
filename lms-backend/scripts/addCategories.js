const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Category = require('../models/Category');

const categories = [
  'Programming',
  'Web Development', 
  'Data Science',
  'Marketing',
  'Design',
  'Security',
  'Mobile Development',
  'Cloud Computing',
  'Finance',
  'Photography'
];

const addCategories = async () => {
  try {
    await connectDB();
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Add new categories
    for (const categoryName of categories) {
      const category = new Category({
        name: categoryName,
        description: `Category for ${categoryName} courses`
      });
      await category.save();
      console.log(`Added category: ${categoryName}`);
    }
    
    console.log('Categories added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding categories:', error);
    process.exit(1);
  }
};

addCategories();