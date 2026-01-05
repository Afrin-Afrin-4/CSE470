const axios = require('axios');

// Get token from previous login
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzVhYTIwOWFmNjEwMzRkMzdhMmY2ZiIsImlhdCI6MTc2NTEyNDY5NSwiZXhwIjoxNzY3NzE2Njk1fQ.7AqZPuW0tojG-bZqoXpaWdc73SjoXeDmxuocZ0OYUoI';

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

async function addCourses() {
  try {
    console.log('Adding YouTube courses to the database...\n');
    
    for (let i = 0; i < youtubeCourses.length; i++) {
      const course = youtubeCourses[i];
      
      try {
        const response = await axios.post('http://localhost:5000/api/courses', course, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`${i + 1}. Added: ${course.title}`);
        console.log(`   Category: ${course.category}`);
        console.log(`   Level: ${course.level}`);
        console.log(`   Price: $${course.price}`);
        console.log(`   Lessons: ${course.lessons.length}\n`);
      } catch (error) {
        console.error(`Failed to add course "${course.title}":`, error.response ? error.response.data : error.message);
      }
    }
    
    console.log('All courses have been added successfully!');
    
    // Verify courses were added
    const coursesResponse = await axios.get('http://localhost:5000/api/courses');
    console.log(`\nTotal courses in database: ${coursesResponse.data.count}`);
    
  } catch (error) {
    console.error('Error adding courses:', error.response ? error.response.data : error.message);
  }
}

addCourses();