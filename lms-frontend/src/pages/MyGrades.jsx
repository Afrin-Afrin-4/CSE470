import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './MyGrades.css';

const MyGrades = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchGrades();
    fetchCourse();
  }, [courseId]);

  const fetchGrades = async () => {
    try {
      const res = await axios.get(`/api/submissions/my-grades/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setGrades(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCourse(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="my-grades">Loading grades...</div>;
  }

  return (
    <div className="my-grades">
      <h1>My Grades</h1>
      {course && <h2>{course.title}</h2>}
      
      {grades.length > 0 ? (
        <div className="grades-list">
          {grades.map((grade) => (
            <div key={grade._id} className="grade-card">
              <div className="grade-header">
                <h3>{grade.assignment}</h3>
                <p>Submitted on: {new Date(grade.submittedAt).toLocaleDateString()}</p>
              </div>
              
              <div className="grade-details">
                {grade.gradedAt ? (
                  <>
                    <div className="grade-score">
                      <span className="score-label">Grade:</span>
                      <span className="score-value">{grade.grade}/100</span>
                    </div>
                    {grade.feedback && (
                      <div className="grade-feedback">
                        <h4>Feedback:</h4>
                        <p>{grade.feedback}</p>
                      </div>
                    )}
                    <p className="graded-date">
                      Graded on: {new Date(grade.gradedAt).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="pending-grade">Grade pending</p>
                )}
              </div>
            </div>
          ))}
          
          <div className="overall-grade">
            <h3>Overall Performance</h3>
            <div className="grade-summary">
              {(() => {
                const gradedAssignments = grades.filter(g => g.gradedAt);
                if (gradedAssignments.length === 0) {
                  return <p>No graded assignments yet</p>;
                }
                
                const totalPoints = gradedAssignments.reduce((sum, g) => sum + g.grade, 0);
                const average = Math.round(totalPoints / gradedAssignments.length);
                
                return (
                  <div className="average-grade">
                    <span className="average-label">Average Grade:</span>
                    <span className="average-value">{average}/100</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <p>You haven't submitted any assignments for this course yet.</p>
      )}
    </div>
  );
};

export default MyGrades;