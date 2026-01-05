import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Progress.css';

const Progress = () => {
  const { user } = useContext(AuthContext);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProgress();
  }, []);

  const fetchAllProgress = async () => {
    try {
      const res = await axios.get('/api/progress', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProgressData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="progress-page">Loading...</div>;
  }

  return (
    <div className="progress-page">
      <h1>My Learning Progress</h1>
      <p>Welcome back, {user?.name}! Track your progress across all enrolled courses.</p>
      
      {progressData.length > 0 ? (
        <div className="progress-grid">
          {progressData.map((progress) => (
            <div key={progress.course._id} className="progress-card">
              <img 
                src={progress.course.thumbnail || 'https://via.placeholder.com/300x200'} 
                alt={progress.course.title} 
              />
              <div className="progress-info">
                <h3>{progress.course.title}</h3>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progress.overallProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">{progress.overallProgress}% Complete</p>
                <div className="progress-stats">
                  <span>{progress.lessonsCompleted.length} lessons completed</span>
                  {progress.completedAt && (
                    <span className="completed-badge">Completed</span>
                  )}
                </div>
                <div className="progress-actions">
                  <Link to={`/courses/${progress.course._id}`} className="btn btn-primary">
                    Continue Learning
                  </Link>
                  <Link to={`/student/attendance/${progress.course._id}`} className="btn btn-secondary">
                    View Attendance
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-progress">
          <p>You haven't started any courses yet.</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default Progress;