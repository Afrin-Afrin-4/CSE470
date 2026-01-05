import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CertificateGenerator from './CertificateGenerator';
import './ProgressTracker.css';

const ProgressTracker = ({ courseId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchProgress();
    fetchCourse();
  }, [courseId]);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`/api/progress/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProgress(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`/api/courses/${courseId}`);
      setCourse(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLessonCompletion = async (lessonId) => {
    try {
      await axios.put(`/api/progress/${courseId}/lessons/${lessonId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh progress after update
      fetchProgress();
    } catch (err) {
      console.error(err);
      alert('Failed to update progress');
    }
  };

  if (loading) {
    return <div className="progress-tracker">Loading...</div>;
  }

  if (!progress) {
    return <div className="progress-tracker">No progress data available</div>;
  }

  const completionPercentage = progress.completionPercentage || 0;

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h3>Course Progress</h3>
        <div className="progress-percentage">
          {completionPercentage}% Complete
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      <div className="lessons-list">
        <h4>Lessons:</h4>
        {course?.lessons?.map((lesson, index) => (
          <div key={index} className="lesson-item">
            <label className="lesson-checkbox">
              <input
                type="checkbox"
                checked={progress.completedLessons?.includes(lesson._id) || false}
                onChange={() => toggleLessonCompletion(lesson._id)}
              />
              <span className="lesson-title">{lesson.title}</span>
            </label>
            <span className="lesson-status">
              {progress.completedLessons?.includes(lesson._id) ? 'Completed' : 'Not Started'}
            </span>
          </div>
        ))}
      </div>
      
      {/* Add certificate generator */}
      <CertificateGenerator courseId={courseId} progress={progress} />
    </div>
  );
};

export default ProgressTracker;