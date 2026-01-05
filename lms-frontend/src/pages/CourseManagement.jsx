import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './InstructorDashboard.css';

const CourseManagement = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      const instructorCourses = res.data.data.filter(course => course.instructor._id === user._id);
      setCourses(instructorCourses);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      await axios.put(`/api/courses/${courseId}`,
        { isPublished: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update course in state
      setCourses(courses.map(course =>
        course._id === courseId
          ? { ...course, isPublished: !currentStatus }
          : course
      ));

      alert(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update course status');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Remove course from state
        setCourses(courses.filter(course => course._id !== courseId));
        alert('Course deleted successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to delete course');
      }
    }
  };

  if (loading) {
    return <div className="instructor-dashboard">Loading...</div>;
  }

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <h1>Course Management</h1>
        <p>Manage all your courses</p>
        <Link to="/instructor/create-course" className="btn btn-primary">
          Create New Course
        </Link>
      </div>

      <div className="courses-section">
        <h2>My Courses</h2>
        {courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                  alt={course.title}
                />
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="description">{course.description}</p>
                  <div className="course-meta">
                    <span className="students">{course.studentsEnrolled?.length || 0} students</span>
                    <span className={`status ${course.isPublished ? 'published' : 'draft'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="course-actions">
                    <Link to={`/instructor/edit-course/${course._id}`} className="btn btn-small btn-edit">
                      Edit
                    </Link>
                    <Link to={`/instructor/grade/${course._id}`} className="btn btn-small btn-grade">
                      Grade Submissions
                    </Link>
                    <Link to={`/instructor/mark-attendance/${course._id}`} className="btn btn-small btn-attendance">
                      Mark Attendance
                    </Link>
                    <Link to={`/instructor/create-quiz/${course._id}`} className="btn btn-small btn-primary">
                      Add Quiz
                    </Link>
                    <Link to={`/instructor/create-assignment/${course._id}`} className="btn btn-small btn-secondary">
                      Add Assignment
                    </Link>
                    <button
                      className={`btn btn-small ${course.isPublished ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handlePublishToggle(course._id, course.isPublished)}
                    >
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      className="btn btn-small btn-error"
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't created any courses yet.</p>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;