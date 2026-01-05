# IntelliLearn - Smart Learning Platform

A full-stack Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User Authentication (Register, Login, JWT)
- Role-based access control (Student, Instructor, Admin)
- Course Management (Create, Read, Update, Delete)
- Course Enrollment
- Progress Tracking
- Grading System
- Attendance Tracking
- Payment Processing
- Reporting Dashboard
- Responsive UI

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- CSS3 for styling

## Project Structure

```
intellilearn/
├── lms-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
└── lms-frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── hooks/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
  - *Need to share your DB? Read [How to Share Your Database](DATABASE_SHARING.md)*
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install backend dependencies:
```bash
cd lms-backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../lms-frontend
npm install
```

### Environment Variables

Create a `.env` file in the `lms-backend` directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intellilearn
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

### Running the Application

1. Start the backend server:
```bash
cd lms-backend
npm run dev
```

2. Start the frontend development server:
```bash
cd lms-frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd lms-frontend
vercel --prod
```

### Backend Deployment (Railway/Heroku)

Refer to the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions on deploying the backend to various cloud platforms.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a single course
- `POST /api/courses` - Create a new course (Instructor/Admin only)
- `PUT /api/courses/:id` - Update a course (Instructor/Admin only)
- `DELETE /api/courses/:id` - Delete a course (Instructor/Admin only)
- `PUT /api/courses/:id/enroll` - Enroll in a course

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get a user by ID (Admin only)
- `GET /api/users/me/courses` - Get current user's enrolled courses

### Progress
- `GET /api/progress` - Get all progress for current user
- `GET /api/progress/:courseId` - Get progress for a specific course
- `PUT /api/progress/:courseId/lessons/:lessonId` - Update lesson completion status

### Submissions
- `POST /api/submissions` - Create a new submission
- `GET /api/submissions/course/:courseId` - Get all submissions for a course
- `PUT /api/submissions/:id/grade` - Grade a submission

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/course/:courseId` - Get attendance for a course
- `GET /api/attendance/course/:courseId/student/:studentId` - Get student attendance
- `GET /api/attendance/course/:courseId/student/:studentId/summary` - Get attendance summary

### Payments
- `POST /api/payments/process` - Process a payment
- `GET /api/payments/history` - Get payment history

### Reports
- `GET /api/reports/users` - Get user activity report
- `GET /api/reports/courses` - Get course performance report
- `GET /api/reports/financial` - Get financial report
- `GET /api/reports/enrollment` - Get enrollment report

## Roles and Permissions

- **Student**: Can browse courses, enroll in courses, track progress, submit assignments, view grades
- **Instructor**: Can create and manage their own courses, grade submissions, mark attendance
- **Admin**: Can manage all users and courses, generate reports

## Building for Production

1. Build the frontend:
```bash
cd lms-frontend
npm run build
```

2. Start the backend in production mode:
```bash
cd lms-backend
npm run serve
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.