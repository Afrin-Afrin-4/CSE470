import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './GradeSubmissions.css';

const GradeSubmissions = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState({});
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchSubmissions();
    fetchCourse();
  }, [courseId]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`/api/submissions/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSubmissions(res.data.data);
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

  const handleGradeChange = (submissionId, field, value) => {
    setGrading(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const submitGrade = async (submissionId) => {
    const gradeData = grading[submissionId];
    if (!gradeData || gradeData.grade === undefined) {
      alert('Please enter a grade');
      return;
    }

    try {
      await axios.put(`/api/submissions/${submissionId}/grade`, gradeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update the submission in state
      setSubmissions(prev => prev.map(sub => 
        sub._id === submissionId 
          ? { ...sub, grade: gradeData.grade, feedback: gradeData.feedback, gradedBy: user, gradedAt: new Date() }
          : sub
      ));
      
      // Clear the grading state for this submission
      setGrading(prev => {
        const newState = { ...prev };
        delete newState[submissionId];
        return newState;
      });
      
      alert('Grade submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit grade');
    }
  };

  if (loading) {
    return <div className="grade-submissions">Loading submissions...</div>;
  }

  return (
    <div className="grade-submissions">
      <h1>Grade Submissions</h1>
      {course && <h2>{course.title}</h2>}
      
      {submissions.length > 0 ? (
        <div className="submissions-list">
          {submissions.map((submission) => (
            <div key={submission._id} className="submission-card">
              <div className="submission-header">
                <h3>{submission.assignment}</h3>
                <p>Submitted by: {submission.student?.name}</p>
                <p>Submitted on: {new Date(submission.submittedAt).toLocaleString()}</p>
              </div>
              
              {submission.submissionText && (
                <div className="submission-content">
                  <h4>Submission:</h4>
                  <p>{submission.submissionText}</p>
                </div>
              )}
              
              {submission.submissionFile && (
                <div className="submission-file">
                  <h4>Attached File:</h4>
                  <a href={submission.submissionFile} target="_blank" rel="noopener noreferrer">
                    Download File
                  </a>
                </div>
              )}
              
              <div className="grading-section">
                <h4>Grade Assignment</h4>
                <div className="grade-inputs">
                  <div className="form-group">
                    <label>Grade (0-100):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={grading[submission._id]?.grade || submission.grade || ''}
                      onChange={(e) => handleGradeChange(submission._id, 'grade', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Feedback:</label>
                    <textarea
                      value={grading[submission._id]?.feedback || submission.feedback || ''}
                      onChange={(e) => handleGradeChange(submission._id, 'feedback', e.target.value)}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary"
                  onClick={() => submitGrade(submission._id)}
                  disabled={submission.gradedAt && !grading[submission._id]}
                >
                  {submission.gradedAt ? 'Update Grade' : 'Submit Grade'}
                </button>
                
                {submission.gradedAt && (
                  <div className="previous-grade">
                    <p><strong>Previous Grade:</strong> {submission.grade} by {submission.gradedBy?.name} on {new Date(submission.gradedAt).toLocaleString()}</p>
                    {submission.feedback && <p><strong>Feedback:</strong> {submission.feedback}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No submissions found for this course.</p>
      )}
    </div>
  );
};

export default GradeSubmissions;