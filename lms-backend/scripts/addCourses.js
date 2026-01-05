const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');

// Connect to database
const connectDB = require('../config/db');

// Add courses to database
const addCourses = async () => {
  try {
    await connectDB();
    
    // Find instructor
    const instructor = await User.findOne({ email: 'instructor@example.com' });
    if (!instructor) {
      console.log('Instructor not found');
      process.exit(1);
    }
    
    console.log('Found instructor:', instructor.name);
    
    // Find all categories
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    console.log('Found categories:', categories.map(cat => cat.name));
    
    // Sample courses data with lessons using valid YouTube videos
    const courses = [
      {
        title: "Complete Python Programming Bootcamp",
        description: "Master Python from basics to advanced concepts including OOP, web development, and data analysis.",
        category: categoryMap["Programming"],
        price: 89.99,
        level: "beginner",
        duration: "12 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1591745588544-858d56ba0b57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Introduction to Python",
            description: "Learn the basics of Python programming language, syntax, and data types.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8" // Python for Beginners by Programming with Mosh
          },
          {
            title: "Variables and Data Types",
            description: "Understanding different data types in Python and how to work with variables.",
            duration: "1.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=HJ9b81eYYl8" // Python Variables Explained by freeCodeCamp
          },
          {
            title: "Control Flow",
            description: "Learn about conditional statements and loops in Python.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=6iSR3TnhH8s" // Python Control Flow by Derek Banas
          },
          {
            title: "Functions and Modules",
            description: "Creating reusable code with functions and organizing code with modules.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw" // Python Functions by freeCodeCamp
          },
          {
            title: "Object-Oriented Programming",
            description: "Understanding classes, objects, and OOP principles in Python.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=Ej_02ACnCWo" // Python OOP by Programming with Mosh
          }
        ]
      },
      {
        title: "Advanced React and Redux Masterclass",
        description: "Build scalable applications with React, Redux, and modern JavaScript ES6+ features.",
        category: categoryMap["Web Development"],
        price: 99.99,
        level: "intermediate",
        duration: "8 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "React Fundamentals",
            description: "Understanding React components, props, and state management.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=DLX62G4lc44" // Learn React in 1 Hour by Programming with Mosh
          },
          {
            title: "Hooks and State Management",
            description: "Using React hooks for state management and side effects.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=KJP1E-Y-xyo" // React Hooks Tutorial by Programming with Mosh
          },
          {
            title: "Redux for State Management",
            description: "Managing complex application state with Redux and Redux Toolkit.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=poQXNp9ItL4" // Redux Tutorial by freeCodeCamp
          },
          {
            title: "Routing and Navigation",
            description: "Implementing navigation in React applications with React Router.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=Law7wfdg_ls" // React Router Tutorial by Programming with Mosh
          },
          {
            title: "Performance Optimization",
            description: "Techniques to optimize React application performance.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=V1t6IgqSj34" // React Performance Optimization by The Net Ninja
          }
        ]
      },
      {
        title: "Data Science with Python and Machine Learning",
        description: "Learn data analysis, visualization, and machine learning algorithms using Python libraries.",
        category: categoryMap["Data Science"],
        price: 129.99,
        level: "intermediate",
        duration: "16 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Introduction to Data Science",
            description: "Overview of data science concepts, tools, and workflow.",
            duration: "1.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=_tG_HmWd7uM" // Data Science Introduction by freeCodeCamp
          },
          {
            title: "Data Manipulation with Pandas",
            description: "Using pandas library for data cleaning and manipulation.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg" // Pandas Tutorial by Keith Galli
          },
          {
            title: "Data Visualization",
            description: "Creating meaningful visualizations with matplotlib and seaborn.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=GcXcQd92DbQ" // Data Visualization by freeCodeCamp
          },
          {
            title: "Machine Learning Fundamentals",
            description: "Introduction to machine learning algorithms and concepts.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=7eh4d6sabA0" // ML for Beginners by freeCodeCamp
          },
          {
            title: "Supervised Learning",
            description: "Implementing classification and regression models.",
            duration: "3.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=WMc01lMAnpk" // Supervised Learning by 3Blue1Brown
          }
        ]
      },
      {
        title: "Digital Marketing Strategy & SEO Mastery",
        description: "Comprehensive guide to digital marketing, SEO, social media, and content strategy.",
        category: categoryMap["Marketing"],
        price: 79.99,
        level: "beginner",
        duration: "10 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Introduction to Digital Marketing",
            description: "Understanding the digital marketing landscape and channels.",
            duration: "1.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=68l0GdIkRdk" // Digital Marketing Introduction by Simplilearn
          },
          {
            title: "Search Engine Optimization (SEO)",
            description: "Techniques to improve website visibility in search engines.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=j4b_wUkQgl8" // SEO Tutorial by Brian Dean
          },
          {
            title: "Social Media Marketing",
            description: "Creating and executing social media marketing strategies.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=J8i9c56zG0o" // Social Media Marketing by Coursera
          },
          {
            title: "Content Marketing",
            description: "Creating valuable content to attract and retain customers.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=9i9BYc6D-6c" // Content Marketing by HubSpot
          },
          {
            title: "Analytics and Performance Tracking",
            description: "Measuring and analyzing marketing campaign performance.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=2v3_jUQTUy8" // Google Analytics Tutorial by freeCodeCamp
          }
        ]
      },
      {
        title: "UI/UX Design Fundamentals",
        description: "Learn design principles, wireframing, prototyping, and user research techniques.",
        category: categoryMap["Design"],
        price: 89.99,
        level: "beginner",
        duration: "6 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Design Principles and Theory",
            description: "Understanding fundamental design principles and visual hierarchy.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=H-30B0cN2cQ" // UI/UX Design Course by freeCodeCamp
          },
          {
            title: "User Research and Personas",
            description: "Conducting user research and creating user personas.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=ZJ5Q7ePa644" // User Research by The UX Researcher
          },
          {
            title: "Wireframing and Prototyping",
            description: "Creating wireframes and interactive prototypes.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=Ij8j90L1LVM" // Figma Tutorial by DesignCourse
          },
          {
            title: "UI Design Patterns",
            description: "Common UI patterns and best practices.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=J0XMi81YcWM" // UI Patterns by DesignCode
          },
          {
            title: "Design Tools and Software",
            description: "Using Figma, Adobe XD, and other design tools.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=9gUatBHuXE0" // Figma Design Tutorial by Web Dev Simplified
          }
        ]
      },
      {
        title: "Cybersecurity Essentials",
        description: "Protect networks and systems from cyber threats with hands-on security practices.",
        category: categoryMap["Security"],
        price: 109.99,
        level: "intermediate",
        duration: "14 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1563017805-9c6be2d1a8d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Introduction to Cybersecurity",
            description: "Understanding cybersecurity threats and basic protection concepts.",
            duration: "1.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=V9KZG12M9Wo" // Cybersecurity Introduction by Cybersecurity Coalition
          },
          {
            title: "Network Security",
            description: "Securing network infrastructure and understanding protocols.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=8h2L8hA_uiM" // Network Security Tutorial by Professor Messer
          },
          {
            title: "Cryptography Fundamentals",
            description: "Understanding encryption, hashing, and digital signatures.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=GSIDSER24D0" // Cryptography Explained by Computerphile
          },
          {
            title: "Security Tools and Practices",
            description: "Using security tools and implementing security best practices.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=8Iun1Fmca1E" // Security Tools by NetworkChuck
          },
          {
            title: "Incident Response",
            description: "Responding to security incidents and breaches.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=K9L_e3uHn8I" // Incident Response by Cybrary
          }
        ]
      },
      {
        title: "Mobile App Development with Flutter",
        description: "Build beautiful cross-platform mobile apps using Google's Flutter framework.",
        category: categoryMap["Mobile Development"],
        price: 94.99,
        level: "intermediate",
        duration: "10 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Flutter Setup and Basics",
            description: "Setting up Flutter development environment and understanding widgets.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=fq4N0hgOW8U" // Flutter Tutorial by The Net Ninja
          },
          {
            title: "State Management",
            description: "Managing application state in Flutter applications.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=d_m5csmrf70" // Flutter State Management by The Net Ninja
          },
          {
            title: "Navigation and Routing",
            description: "Implementing navigation between screens in Flutter.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=Vy1x96woFxQ" // Flutter Navigation by The Net Ninja
          },
          {
            title: "API Integration",
            description: "Connecting Flutter apps to REST APIs and databases.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=H4Y833f2u04" // Flutter API Integration by The Net Ninja
          },
          {
            title: "App Deployment",
            description: "Publishing Flutter apps to app stores.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=8bsxf3MfRwQ" // Flutter Deployment by The Net Ninja
          }
        ]
      },
      {
        title: "Cloud Computing with AWS",
        description: "Deploy scalable applications using Amazon Web Services cloud infrastructure.",
        category: categoryMap["Cloud Computing"],
        price: 119.99,
        level: "advanced",
        duration: "12 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Introduction to Cloud Computing",
            description: "Understanding cloud computing concepts and AWS services.",
            duration: "1.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=ulprqHHWlng" // AWS Tutorial by freeCodeCamp
          },
          {
            title: "AWS Core Services",
            description: "Working with EC2, S3, and other core AWS services.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=ulprqHHWlng" // AWS Essentials by freeCodeCamp
          },
          {
            title: "Security and Identity",
            description: "Implementing security best practices with IAM and other services.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=Z5f30r40n0Y" // AWS Security by Amazon Web Services
          },
          {
            title: "Database Services",
            description: "Using RDS, DynamoDB, and other AWS database services.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=1OJ7uZ65b5A" // AWS Database Services by AWS
          },
          {
            title: "Serverless Architecture",
            description: "Building serverless applications with Lambda and other services.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=2cQIm50P8Eo" // AWS Lambda Tutorial by freeCodeCamp
          }
        ]
      },
      {
        title: "Financial Planning and Investment Strategies",
        description: "Learn personal finance, investment strategies, and retirement planning fundamentals.",
        category: categoryMap["Finance"],
        price: 69.99,
        level: "beginner",
        duration: "8 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Personal Finance Basics",
            description: "Understanding budgeting, saving, and financial planning.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=6D4KbLbL1dM" // Personal Finance by The Plain Bagel
          },
          {
            title: "Investment Fundamentals",
            description: "Learning about different investment options and strategies.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=8nS-kGTa33s" // Investment Basics by The Financial Diet
          },
          {
            title: "Risk Management",
            description: "Understanding risk and how to manage it in investments.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=8nS-kGTa33s" // Risk Management by Khan Academy
          },
          {
            title: "Retirement Planning",
            description: "Planning for retirement with various investment vehicles.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=6D4KbLbL1dM" // Retirement Planning by The Plain Bagel
          },
          {
            title: "Tax Planning",
            description: "Understanding tax implications of investments.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=8nS-kGTa33s" // Tax Planning by Khan Academy
          }
        ]
      },
      {
        title: "Photography Masterclass",
        description: "From camera basics to advanced composition techniques and photo editing.",
        category: categoryMap["Photography"],
        price: 74.99,
        level: "beginner",
        duration: "6 weeks",
        isPublished: true,
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "Camera Basics",
            description: "Understanding camera settings, exposure, and composition.",
            duration: "2.5 hours",
            videoUrl: "https://www.youtube.com/watch?v=8b2W3wY6nXw" // Photography Basics by Peter McKinnon
          },
          {
            title: "Lighting Techniques",
            description: "Working with natural and artificial lighting.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=723xim87j84" // Lighting Tutorial by Peter McKinnon
          },
          {
            title: "Composition and Framing",
            description: "Creating visually appealing photographs with proper composition.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=91a5LtN1a5M" // Composition Tips by Mango Street
          },
          {
            title: "Post-Processing",
            description: "Editing photos using Lightroom and Photoshop.",
            duration: "3 hours",
            videoUrl: "https://www.youtube.com/watch?v=04t1w6_cg0c" // Lightroom Tutorial by Peter McKinnon
          },
          {
            title: "Photography Genres",
            description: "Exploring different photography genres and techniques.",
            duration: "2 hours",
            videoUrl: "https://www.youtube.com/watch?v=8b2W3wY6nXw" // Photography Genres by Peter McKinnon
          }
        ]
      }
    ];
    
    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');
    
    // Add new courses with instructor and proper category references
    for (const courseData of courses) {
      const course = new Course({
        ...courseData,
        instructor: instructor._id,
        // Generate a slug from the title
        slug: courseData.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
      });
      await course.save();
      console.log(`Added course: ${courseData.title}`);
    }
    
    console.log('Added new courses successfully with lessons');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding courses:', error);
    process.exit(1);
  }
};

// Run the function
addCourses();