import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './AdminReports.css';

const AdminReports = () => {
  const { user } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [reportData, setReportData] = useState({
    overview: null,
    courses: null,
    users: null,
    financial: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'overview':
          res = await axios.get('/api/reports/overview', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setReportData(prev => ({ ...prev, overview: res.data.data }));
          break;
        case 'courses':
          res = await axios.get('/api/reports/courses', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setReportData(prev => ({ ...prev, courses: res.data.data }));
          break;
        case 'users':
          res = await axios.get('/api/reports/users', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setReportData(prev => ({ ...prev, users: res.data.data }));
          break;
        case 'financial':
          res = await axios.get('/api/reports/financial', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setReportData(prev => ({ ...prev, financial: res.data.data }));
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewReport = () => {
    const { overview } = reportData;
    if (!overview) return null;

    return (
      <div className="report-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{overview.totals.users}</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p className="stat-value">{overview.totals.courses}</p>
          </div>
          <div className="stat-card">
            <h3>Published Courses</h3>
            <p className="stat-value">{overview.totals.publishedCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Total Submissions</h3>
            <p className="stat-value">{overview.totals.submissions}</p>
          </div>
        </div>

        <div className="chart-section">
          <h3>User Roles Distribution</h3>
          <div className="roles-chart">
            {overview.userRoles.map((role) => (
              <div key={role._id} className="role-bar">
                <div className="role-label">
                  <span className="role-name">{role._id}</span>
                  <span className="role-count">{role.count}</span>
                </div>
                <div className="role-progress">
                  <div 
                    className={`role-progress-bar role-${role._id}`}
                    style={{ width: `${(role.count / overview.totals.users) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity (Last 30 Days)</h3>
          <div className="activity-grid">
            <div className="activity-card">
              <h4>New Users</h4>
              <p className="activity-value">{overview.recentActivity.users}</p>
            </div>
            <div className="activity-card">
              <h4>New Courses</h4>
              <p className="activity-value">{overview.recentActivity.courses}</p>
            </div>
            <div className="activity-card">
              <h4>New Submissions</h4>
              <p className="activity-value">{overview.recentActivity.submissions}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCoursesReport = () => {
    const { courses } = reportData;
    if (!courses) return null;

    return (
      <div className="report-content">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Instructor</th>
                <th>Enrollments</th>
                <th>Avg. Grade</th>
                <th>Price</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.title}</td>
                  <td>{course.instructor?.name}</td>
                  <td>{course.enrollmentCount}</td>
                  <td>{course.averageGrade || 'N/A'}</td>
                  <td>${course.price}</td>
                  <td>${course.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUsersReport = () => {
    const { users } = reportData;
    if (!users) return null;

    return (
      <div className="report-content">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Enrolled Courses</th>
                <th>Submissions</th>
                <th>Courses Taught</th>
                <th>Member Since</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.enrolledCourses}</td>
                  <td>{user.submissions}</td>
                  <td>{user.coursesTaught}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    const { financial } = reportData;
    if (!financial) return null;

    return (
      <div className="report-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${financial.totalRevenue}</p>
          </div>
          <div className="stat-card">
            <h3>Paid Courses</h3>
            <p className="stat-value">{financial.totalPaidCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Free Courses</h3>
            <p className="stat-value">{financial.totalFreeCourses}</p>
          </div>
        </div>

        <div className="table-container">
          <h3>Course Revenue Breakdown</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Price</th>
                <th>Enrollments</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {financial.courseRevenue.map((course, index) => (
                <tr key={index}>
                  <td>{course.title}</td>
                  <td>${course.price}</td>
                  <td>{course.enrollmentCount}</td>
                  <td>${course.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-reports">
      <h1>Admin Reports</h1>
      <p>Welcome, {user?.name}! View system reports and analytics.</p>
      
      <div className="report-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Course Performance
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Activity
        </button>
        <button 
          className={`tab-button ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading report data...</div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverviewReport()}
          {activeTab === 'courses' && renderCoursesReport()}
          {activeTab === 'users' && renderUsersReport()}
          {activeTab === 'financial' && renderFinancialReport()}
        </>
      )}
    </div>
  );
};

export default AdminReports;