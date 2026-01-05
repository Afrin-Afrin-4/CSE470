import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './AssignmentSubmission.css';

const AssignmentSubmission = ({ courseId, lessonIndex }) => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, [courseId, lessonIndex]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/assignments/lesson/${lessonIndex}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAssignments(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assignments');
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    for (const assignment of assignments) {
      try {
        const response = await axios.get(`/api/assignments/${assignment._id}/my-submission`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSubmissions(prev => ({
          ...prev,
          [assignment._id]: response.data.data
        }));
      } catch (err) {
        // Assignment may not have been submitted yet
        setSubmissions(prev => ({
          ...prev,
          [assignment._id]: null
        }));
      }
    }
  };

  const handleFileChange = (assignmentId, e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [assignmentId]: file
      }));
    }
  };

  const handleUpload = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(prev => ({
      ...prev,
      [assignmentId]: true
    }));

    try {
      // In a real implementation, we would upload to a file storage service
      // For now, we'll simulate the upload by creating a URL
      const formData = new FormData();
      formData.append('file', file);
      
      // This is a placeholder - in a real app, you'd upload to cloud storage
      // and get back a URL. For now, we'll just send the filename.
      const response = await axios.post(`/api/assignments/${assignmentId}/submit`, {
        fileUrl: `https://example.com/uploads/${file.name}`, // Placeholder URL
        fileName: file.name
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // Update the submission status
      setSubmissions(prev => ({
        ...prev,
        [assignmentId]: response.data.data
      }));

      // Clear the selected file
      setSelectedFiles(prev => ({
        ...prev,
        [assignmentId]: null
      }));

      alert('Assignment submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setUploading(prev => ({
        ...prev,
        [assignmentId]: false
      }));
    }
  };

  if (loading) {
    return <div className="assignment-submission">Loading assignments...</div>;
  }

  if (error) {
    return <div className="assignment-submission">Error: {error}</div>;
  }

  return (
    <div className="assignment-submission">
      <h4>Assignments</h4>
      
      {assignments.length === 0 ? (
        <p>No assignments for this lesson.</p>
      ) : (
        <div className="assignments-list">
          {assignments.map(assignment => {
            const submission = submissions[assignment._id];
            const isSubmitted = !!submission;
            const isPastDue = new Date(assignment.dueDate) < new Date();
            const isUploading = uploading[assignment._id] || false;
            const selectedFile = selectedFiles[assignment._id] || null;

            return (
              <div key={assignment._id} className="assignment-item">
                <div className="assignment-header">
                  <h5>{assignment.title}</h5>
                  <span className="due-date">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="assignment-description">{assignment.description}</p>
                
                <div className="assignment-status">
                  {isSubmitted ? (
                    <div className="submission-status submitted">
                      <span className="status-text">Submitted</span>
                      {submission.submittedAt && (
                        <span className="submitted-date">
                          On: {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                      {submission.grade !== undefined && (
                        <span className="grade">
                          Grade: {submission.grade}/{assignment.maxPoints}
                        </span>
                      )}
                    </div>
                  ) : isPastDue ? (
                    <div className="submission-status past-due">
                      <span className="status-text">Past Due</span>
                    </div>
                  ) : (
                    <div className="submission-form">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(assignment._id, e)}
                        className="file-input"
                      />
                      {selectedFile && (
                        <div className="selected-file">
                          Selected: {selectedFile.name}
                        </div>
                      )}
                      <button
                        className="btn btn-primary upload-btn"
                        onClick={() => handleUpload(assignment._id)}
                        disabled={isUploading || !selectedFile}
                      >
                        {isUploading ? 'Uploading...' : 'Submit Assignment'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmission;