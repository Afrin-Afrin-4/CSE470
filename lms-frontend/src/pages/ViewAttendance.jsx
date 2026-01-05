import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './ViewAttendance.css';

const ViewAttendance = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [course, setCourse] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [courseId]);

  const fetchAttendanceData = async () => {
    try {
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCourse(courseRes.data.data);
      
      // Fetch attendance records
      const attendanceRes = await axios.get(`/api/attendance/course/${courseId}/student/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAttendanceRecords(attendanceRes.data.data);
      
      // Fetch attendance summary
      const summaryRes = await axios.get(`/api/attendance/course/${courseId}/student/${user._id}/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSummary(summaryRes.data.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="view-attendance">Loading attendance data...</div>;
  }

  return (
    <div className="view-attendance">
      <h1>Attendance Records</h1>
      {course && <h2>{course.title}</h2>}
      
      {summary && (
        <div className="attendance-summary">
          <h3>Attendance Summary</h3>
          <div className="summary-stats">
            <div className="stat-card">
              <span className="stat-value">{summary.totalSessions}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{summary.presentCount}</span>
              <span className="stat-label">Present</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{summary.absentCount}</span>
              <span className="stat-label">Absent</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{summary.lateCount}</span>
              <span className="stat-label">Late</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{summary.attendancePercentage}%</span>
              <span className="stat-label">Attendance Rate</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="attendance-records">
        <h3>Detailed Records</h3>
        {attendanceRecords.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Session</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={`${record.date}-${record.session}`}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.session}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td>{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No attendance records found for this course.</p>
        )}
      </div>
      
      <Link to="/progress" className="btn btn-secondary">
        Back to Progress
      </Link>
    </div>
  );
};

export default ViewAttendance;