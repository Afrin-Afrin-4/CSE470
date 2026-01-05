import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoleDashboard from './pages/RoleDashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AdminUsers from './pages/AdminUsers';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CourseManagement from './pages/CourseManagement';
import CreateQuiz from './pages/CreateQuiz';
import CreateAssignment from './pages/CreateAssignment';
import Progress from './pages/Progress';
import ProgressDetail from './pages/ProgressDetail';
import GradeSubmissions from './pages/GradeSubmissions';
import MyGrades from './pages/MyGrades';
import ViewAttendance from './pages/ViewAttendance';
import PaymentPage from './pages/PaymentPage';
import PaymentHistory from './pages/PaymentHistory';
import SmoothAnimationDemo from './components/SmoothAnimationDemo';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import InstructorRoute from './components/InstructorRoute';
import MarkAttendance from './pages/MarkAttendance';
import StudentProgress from './pages/StudentProgress';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<RoleDashboard />} />
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/progress/:courseId" element={<ProgressDetail />} />
              <Route path="/student-progress" element={<StudentProgress />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/checkout/:courseId" element={<PaymentPage />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/smooth-demo" element={<SmoothAnimationDemo />} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <AdminReports />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />

              {/* Instructor Routes */}
              <Route
                path="/instructor/dashboard"
                element={
                  <InstructorRoute>
                    <InstructorDashboard />
                  </InstructorRoute>
                }
              />
              <Route
                path="/instructor/courses"
                element={
                  <InstructorRoute>
                    <CourseManagement />
                  </InstructorRoute>
                }
              />
              <Route
                path="/instructor/create-course"
                element={
                  <InstructorRoute>
                    <CreateCourse />
                  </InstructorRoute>
                }
              />
              <Route
                path="/instructor/edit-course/:id"
                element={
                  <InstructorRoute>
                    <EditCourse />
                  </InstructorRoute>
                }
              />
              <Route
                path="/instructor/grade/:courseId"
                element={
                  <InstructorRoute>
                    <GradeSubmissions />
                  </InstructorRoute>
                }
              />
              <Route
                path="/instructor/mark-attendance/:courseId"
                element={
                  <InstructorRoute>
                    <MarkAttendance />
                  </InstructorRoute>
                }
              />
              <Route
                path="/instructor/create-quiz/:courseId"
                element={
                  <InstructorRoute>
                    <CreateQuiz />
                  </InstructorRoute>
                }
              />
              <Route
                path="/instructor/create-assignment/:courseId"
                element={
                  <InstructorRoute>
                    <CreateAssignment />
                  </InstructorRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student/grades/:courseId"
                element={<MyGrades />}
              />
              <Route
                path="/student/attendance/:courseId"
                element={<ViewAttendance />}
              />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;