import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [session, setSession] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourseAndStudents();
  }, [courseId]);

  const fetchCourseAndStudents = async () => {
    try {
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCourse(courseRes.data.data);
      
      // Fetch enrolled students
      setStudents(courseRes.data.data.studentsEnrolled || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      alert('Please enter a session name');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Submit attendance for each student
      const promises = students.map(async (student) => {
        const studentAttendance = attendanceData[student._id] || {};
        return axios.post('/api/attendance/mark', {
          courseId,
          studentId: student._id,
          session,
          date,
          status: studentAttendance.status || 'present',
          notes: studentAttendance.notes || ''
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      });
      
      await Promise.all(promises);
      
      alert('Attendance marked successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to mark attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mark-attendance">Loading course and student data...</div>;
  }

  return (
    <div className="mark-attendance">
      <h1>Mark Attendance</h1>
      {course && <h2>{course.title}</h2>}
      
      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="session">Session:</label>
            <input
              type="text"
              id="session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="e.g., Week 1, Lecture 1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="students-table">
          <h3>Students</h3>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>
                    <select
                      value={attendanceData[student._id]?.status || 'present'}
                      onChange={(e) => handleAttendanceChange(student._id, 'status', e.target.value)}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={attendanceData[student._id]?.notes || ''}
                      onChange={(e) => handleAttendanceChange(student._id, 'notes', e.target.value)}
                      placeholder="Additional notes"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </form>
    </div>
  );
};

export default MarkAttendance;