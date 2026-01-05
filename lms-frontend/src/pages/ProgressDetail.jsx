import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ProgressTracker from '../components/ProgressTracker';
import './ProgressDetail.css';

const ProgressDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseAndProgress();
  }, [courseId]);

  const fetchCourseAndProgress = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${courseId}`);
      setCourse(courseRes.data.data);
      
      // Fetch progress for the course
      const progressRes = await axios.get(`/api/progress/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProgress(progressRes.data.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load progress details');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="progress-detail">Loading progress details...</div>;
  }

  if (error) {
    return <div className="progress-detail">Error: {error}</div>;
  }

  if (!course || !progress) {
    return <div className="progress-detail">Course or progress data not found.</div>;
  }

  const completionPercentage = progress.completionPercentage || 0;

  return (
    <div className="progress-detail">
      <div className="progress-header">
        <button className="btn btn-secondary" onClick={() => navigate('/student-progress')}>
          ← Back to Progress Overview
        </button>
        <h1>Progress Details: {course.title}</h1>
        <div className="course-info">
          <p><strong>Instructor:</strong> {course.instructor?.name}</p>
          <p><strong>Level:</strong> {course.level || 'Beginner'}</p>
          <p><strong>Category:</strong> {course.category}</p>
        </div>
      </div>

      <div className="progress-summary">
        <div className="progress-stats">
          <div className="stat-card">
            <div className="stat-value">{completionPercentage}%</div>
            <div className="stat-label">Complete</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{progress.lessonsCompleted?.length || 0}</div>
            <div className="stat-label">Lessons Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{course.lessons?.length || 0}</div>
            <div className="stat-label">Total Lessons</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {progress.completedAt ? 'Completed' : 'In Progress'}
            </div>
            <div className="stat-label">Status</div>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {completionPercentage}% Complete
          </div>
        </div>
      </div>

      <div className="progress-content">
        <h2>Course Progress Tracker</h2>
        <ProgressTracker courseId={courseId} />
      </div>

      {progress.completedAt && (
        <div className="completion-badge">
          <h3>Congratulations! 🎓</h3>
          <p>You completed this course on {new Date(progress.completedAt).toLocaleDateString()}</p>
        </div>
      )}

      <div className="progress-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Continue Learning
        </button>
        {completionPercentage === 100 && (
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Review Course
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressDetail;