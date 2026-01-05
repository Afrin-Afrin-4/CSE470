const mongoose = require('mongoose');
const Course = require('./Course');
const User = require('./User');

const dotenv = require('dotenv');
dotenv.config({ path: './lms-backend/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// YouTube courses data
const youtubeCourses = [
  {
    title: "Complete JavaScript Course for Beginners",
    description: "Learn JavaScript from scratch with this comprehensive course covering fundamentals to advanced topics. Perfect for beginners who want to become proficient in JavaScript programming.",
    category: "Programming",
    price: 0,
    level: "beginner",
    isPublished: true,
    thumbnail: "https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg",
    lessons: [
      {
        title: "Introduction to JavaScript",
        description: "Learn what JavaScript is and how to set up your development environment.",
        videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
        duration: "15:30"
      },
      {
        title: "Variables and Data Types",
        description: "Understanding variables, data types, and how to work with them in JavaScript.",
        videoUrl: "https://www.youtube.com/embed/UPdl9E0XyVM",
        duration: "18:45"
      },
      {
        title: "Functions in JavaScript",
        description: "Learn how to create and use functions to organize your code.",
        videoUrl: "https://www.youtube.com/embed/N8ap4l8Z7Vg",
        duration: "22:10"
      }
    ]
  },
  {
    title: "Python for Data Science - Full Course",
    description: "Master Python for data science with this comprehensive tutorial covering NumPy, Pandas, Matplotlib, and more. Learn how to analyze and visualize data like a professional.",
    category: "Data Science",
    price: 0,
    level: "intermediate",
    isPublished: true,
    thumbnail: "https://img.youtube.com/vi/7eh4d6sabA0/maxresdefault.jpg",
    lessons: [
      {
        title: "Python Basics for Data Science",
        description: "Introduction to Python programming for data science applications.",
        videoUrl: "https://www.youtube.com/embed/7eh4d6sabA0",
        duration: "25:15"
      },
      {
        title: "NumPy Tutorial",
        description: "Learn NumPy for numerical computing in Python.",
        videoUrl: "https://www.youtube.com/embed/QUT1VHiLmmI",
        duration: "32:40"
      },
      {
        title: "Pandas DataFrame Tutorial",
        description: "Master data manipulation with Pandas DataFrames.",
        videoUrl: "https://www.youtube.com/embed/ZyhVh-qRZPA",
        duration: "28:55"
      }
    ]
  },
  {
    title: "React JS - Full Course for Beginners",
    description: "Learn React JS from scratch with this complete tutorial. Covers components, props, state, hooks, and building a full application.",
    category: "Web Development",
    price: 0,
    level: "beginner",
    isPublished: true,
    thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg",
    lessons: [
      {
        title: "React Introduction",
        description: "Introduction to React and setting up the development environment.",
        videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
        duration: "20:30"
      },
      {
        title: "Components and Props",
        description: "Learn how to create reusable components and pass data with props.",
        videoUrl: "https://www.youtube.com/embed/Y2hgEGPzTZY",
        duration: "25:45"
      },
      {
        title: "State and Lifecycle",
        description: "Understanding React state management and component lifecycle.",
        videoUrl: "https://www.youtube.com/embed/i793QMV9FxY",
        duration: "30:15"
      }
    ]
  },
  {
    title: "Machine Learning with Python",
    description: "Comprehensive machine learning course covering supervised and unsupervised learning algorithms with Python and scikit-learn.",
    category: "Machine Learning",
    price: 0,
    level: "advanced",
    isPublished: true,
    thumbnail: "https://img.youtube.com/vi/PYD_qhQiWhY/maxresdefault.jpg",
    lessons: [
      {
        title: "Introduction to Machine Learning",
        description: "Understanding the basics of machine learning and types of algorithms.",
        videoUrl: "https://www.youtube.com/embed/PYD_qhQiWhY",
        duration: "22:10"
      },
      {
        title: "Linear Regression",
        description: "Implementing linear regression models with Python.",
        videoUrl: "https://www.youtube.com/embed/E5RjzSK0fvY",
        duration: "28:30"
      },
      {
        title: "Classification Algorithms",
        description: "Learning classification techniques including logistic regression and decision trees.",
        videoUrl: "https://www.youtube.com/embed/H6du_pfuznE",
        duration: "35:20"
      }
    ]
  },
  {
    title: "CSS Flexbox and Grid - Complete Guide",
    description: "Master modern CSS layout techniques with Flexbox and Grid. Learn how to build responsive websites with clean, efficient code.",
    category: "Web Design",
    price: 0,
    level: "beginner",
    isPublished: true,
    thumbnail: "https://img.youtube.com/vi/tXIhdp5R7sc/maxresdefault.jpg",
    lessons: [
      {
        title: "CSS Flexbox Fundamentals",
        description: "Introduction to Flexbox and how to create flexible layouts.",
        videoUrl: "https://www.youtube.com/embed/tXIhdp5R7sc",
        duration: "18:45"
      },
      {
        title: "CSS Grid Layout",
        description: "Learn CSS Grid for two-dimensional layouts.",
        videoUrl: "https://www.youtube.com/embed/jV8BEXPDIIg",
        duration: "24:30"
      },
      {
        title: "Responsive Design with Flexbox and Grid",
        description: "Creating responsive designs that work on all devices.",
        videoUrl: "https://www.youtube.com/embed/Mkza0N8NiK4",
        duration: "20:15"
      }
    ]
  }
];

async function addCoursesDirectly() {
  try {
    console.log('Connecting to database...');

    // Wait for database connection
    await new Promise(resolve => {
      mongoose.connection.on('connected', resolve);
    });

    console.log('Connected to database');

    // Find the instructor user
    const instructor = await User.findOne({ email: 'youtube@example.com' });

    if (!instructor) {
      console.log('Instructor not found. Please create an instructor account first.');
      process.exit(1);
    }

    console.log(`Found instructor: ${instructor.name} (${instructor.email})`);

    // Add instructor ID to all courses
    const coursesWithInstructor = youtubeCourses.map(course => ({
      ...course,
      instructor: instructor._id
    }));

    console.log('\nAdding YouTube courses to the database...\n');

    // Insert all courses
    const insertedCourses = await Course.insertMany(coursesWithInstructor);

    console.log(`Successfully added ${insertedCourses.length} courses:`);
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.category}) - ${course.lessons.length} lessons`);
    });

    // Verify courses were added
    const courseCount = await Course.countDocuments();
    console.log(`\nTotal courses in database: ${courseCount}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding courses:', error);
    mongoose.connection.close();
  }
}

addCoursesDirectly();