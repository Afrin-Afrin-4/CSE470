import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './StudentProgress.css';

const StudentProgress = () => {
  const { user } = useContext(AuthContext);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProgressData(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch progress data');
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="student-progress">Please log in to view your progress.</div>;
  }

  if (loading) {
    return <div className="student-progress">Loading progress data...</div>;
  }

  if (error) {
    return <div className="student-progress">Error: {error}</div>;
  }

  return (
    <div className="student-progress">
      <h1>Your Learning Progress</h1>
      
      {progressData.length === 0 ? (
        <p>You haven't enrolled in any courses yet. <a href="/courses">Browse courses</a> to get started!</p>
      ) : (
        <div className="progress-grid">
          {progressData.map((progress) => (
            <div key={progress._id} className="progress-card">
              <div className="course-info">
                <h3>{progress.course.title}</h3>
                <p className="instructor">Instructor: {progress.course.instructor?.name}</p>
              </div>
              
              <div className="progress-visual">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress.overallProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {progress.overallProgress}% Complete
                </div>
              </div>
              
              <div className="progress-details">
                <p>Lessons Completed: {progress.lessonsCompleted?.length || 0} / {progress.course.lessons?.length || 0}</p>
                <p>Last Accessed: {progress.lastAccessed ? new Date(progress.lastAccessed).toLocaleDateString() : 'Never'}</p>
                {progress.completedAt && (
                  <p className="completed">Course Completed: {new Date(progress.completedAt).toLocaleDateString()}</p>
                )}
              </div>
              
              <div className="progress-actions">
                <a href={`/progress/${progress.course._id}`} className="btn btn-primary">View Details</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentProgress;