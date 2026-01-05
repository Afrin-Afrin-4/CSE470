import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [payments, setPayments] = useState([]); // New state for payments
  const [enrollments, setEnrollments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    totalRevenue: 0,
    activeCourses: 0,
    instructorCount: 0,
    studentCount: 0,
    adminCount: 0,
    recentUsers: 0,
    recentCourses: 0,
    totalLessons: 0,
    totalEnrollments: 0,
    completionRate: 0,
    avgCourseRating: 0,
    totalPayments: 0
  });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [chartData, setChartData] = useState({
    userGrowth: [],
    enrollmentTrends: []
  });

  // Announcement state
  const [selectedCourseForAnnouncement, setSelectedCourseForAnnouncement] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (userSearchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [userSearchTerm, users]);

  useEffect(() => {
    // Filter courses based on search term
    if (courseSearchTerm) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
        (course.instructor?.name && course.instructor.name.toLowerCase().includes(courseSearchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [courseSearchTerm, courses]);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, coursesRes, progressRes, paymentsRes] = await Promise.all([
        axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/courses'),
        axios.get('/api/progress/admin/all', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get('/api/payments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const allUsers = usersRes.data.data;
      const allCourses = coursesRes.data.data;
      const allProgress = progressRes.data.data;
      const allPayments = paymentsRes.data.data;

      const totalEnrollments = allCourses.reduce((sum, course) =>
        sum + (course.studentsEnrolled?.length || 0), 0);

      const instructorCount = allUsers.filter(user => user.role === 'instructor').length;
      const studentCount = allUsers.filter(user => user.role === 'student').length;
      const adminCount = allUsers.filter(user => user.role === 'admin').length;

      // Calculate revenue
      const totalRevenue = totalEnrollments * 50; // Assuming $50 average per enrollment

      // Calculate recent users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsers = allUsers.filter(user =>
        new Date(user.createdAt) > thirtyDaysAgo
      ).length;

      // Calculate recent courses (last 30 days)
      const recentCourses = allCourses.filter(course =>
        new Date(course.createdAt) > thirtyDaysAgo
      ).length;

      // Calculate total lessons
      const totalLessons = allCourses.reduce((sum, course) =>
        sum + (course.lessons?.length || 0), 0);

      // Calculate completion rate
      const completedProgress = allProgress.filter(progress => progress.completedAt).length;
      const completionRate = allProgress.length > 0 ? Math.round((completedProgress / allProgress.length) * 100) : 0;

      // Calculate average course rating
      const totalRatings = allCourses.reduce((sum, course) =>
        sum + (course.ratings?.length || 0), 0);
      const avgCourseRating = allCourses.length > 0 ?
        (allCourses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / allCourses.length).toFixed(1) : 0;

      // Calculate total payments
      const totalPayments = allPayments.reduce((sum, payment) =>
        sum + (payment.amount || 0), 0);

      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setCourses(allCourses);
      setFilteredCourses(allCourses);
      setPayments(allPayments); // Store payments
      setEnrollments(totalEnrollments);
      setReports({
        totalRevenue,
        activeCourses: allCourses.filter(course => course.isPublished).length,
        instructorCount,
        studentCount,
        adminCount,
        recentUsers,
        recentCourses,
        totalLessons,
        totalEnrollments,
        completionRate,
        avgCourseRating,
        totalPayments
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="admin-dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Platform overview and management</p>
          </div>
          <div>
            <Link to="/admin/reports" className="btn btn-primary">
              View Detailed Reports
            </Link>
          </div>
        </div>

        <div className="welcome-banner">
          <h2>Platform Management Center</h2>
          <p>Monitor platform performance, manage users and courses, and generate reports.</p>
        </div>

        {/* Enhanced Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{reports.activeCourses}/{courses.length}</div>
            <div className="stat-label">Active/Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">${reports.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-value">{enrollments}</div>
            <div className="stat-label">Total Enrollments</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-value">{reports.instructorCount}</div>
            <div className="stat-label">Instructors</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-value">{reports.studentCount}</div>
            <div className="stat-label">Students</div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="additional-metrics">
          <div className="metric-card">
            <h3>Platform Performance</h3>
            <div className="metric-content">
              <div className="metric-item">
                <span className="metric-label">New Users (30d)</span>
                <span className="metric-value">{reports.recentUsers}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">New Courses (30d)</span>
                <span className="metric-value">{reports.recentCourses}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Total Lessons</span>
                <span className="metric-value">{reports.totalLessons}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Completion Rate</span>
                <span className="metric-value">{reports.completionRate}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg. Course Rating</span>
                <span className="metric-value">{reports.avgCourseRating}</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h3>User Distribution</h3>
            <div className="distribution-chart">
              <div className="distribution-item">
                <div className="distribution-label">
                  <span className="role-color student"></span>
                  Students
                </div>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill student"
                    style={{ width: `${(reports.studentCount / users.length) * 100 || 0}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{reports.studentCount}</span>
              </div>
              <div className="distribution-item">
                <div className="distribution-label">
                  <span className="role-color instructor"></span>
                  Instructors
                </div>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill instructor"
                    style={{ width: `${(reports.instructorCount / users.length) * 100 || 0}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{reports.instructorCount}</span>
              </div>
              <div className="distribution-item">
                <div className="distribution-label">
                  <span className="role-color admin"></span>
                  Admins
                </div>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill admin"
                    style={{ width: `${(reports.adminCount / users.length) * 100 || 0}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{reports.adminCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="financial-overview">
          <h2>Financial Overview</h2>
          <div className="financial-metrics">
            <div className="financial-card">
              <div className="financial-icon">💰</div>
              <div className="financial-value">${reports.totalRevenue.toLocaleString()}</div>
              <div className="financial-label">Total Revenue</div>
            </div>
            <div className="financial-card">
              <div className="financial-icon">💳</div>
              <div className="financial-value">${reports.totalPayments.toLocaleString()}</div>
              <div className="financial-label">Total Payments</div>
            </div>
            <div className="financial-card">
              <div className="financial-icon">👥</div>
              <div className="financial-value">{reports.totalEnrollments}</div>
              <div className="financial-label">Total Enrollments</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="users-section">
            <div className="section-header">
              <h2>User Management</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-bar"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.slice(0, 5).map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/admin/users/${user._id}`} className="btn btn-small btn-view">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="courses-section">
            <div className="section-header">
              <h2>Course Management</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="search-bar"
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="courses-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Instructor</th>
                    <th>Students</th>
                    <th>Lessons</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.slice(0, 5).map((course) => (
                    <tr key={course._id}>
                      <td>{course.title}</td>
                      <td>{course.instructor?.name}</td>
                      <td>{course.studentsEnrolled?.length || 0}</td>
                      <td>{course.lessons?.length || 0}</td>
                      <td>
                        <span className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/courses/${course._id}`} className="btn btn-small btn-view">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/admin/reports" className="action-card">
                <div className="action-icon">📊</div>
                <h3>Generate Reports</h3>
                <p>Create detailed analytics reports</p>
              </Link>
              <Link to="/admin/users" className="action-card">
                <div className="action-icon">👥</div>
                <h3>User Management</h3>
                <p>View and manage platform users</p>
              </Link>
              <Link to="/admin/courses" className="action-card">
                <div className="action-icon">📚</div>
                <h3>Course Management</h3>
                <p>Review and manage all courses</p>
              </Link>
              <Link to="/admin/payments" className="action-card">
                <div className="action-icon">💳</div>
                <h3>Financial Reports</h3>
                <p>View payment and revenue data</p>
              </Link>
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="transactions-section" style={{ marginBottom: '2rem' }}>
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <Link to="/admin/payments" className="btn btn-small btn-view">View All</Link>
            </div>
            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.slice(0, 5).map((payment) => (
                      <tr key={payment._id}>
                        <td style={{ fontFamily: 'monospace' }}>{payment.transactionId?.substring(0, 12)}...</td>
                        <td>{payment.student?.name || 'Unknown'}</td>
                        <td>{payment.course?.title || 'Unknown'}</td>
                        <td>${payment.amount}</td>
                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${payment.status === 'completed' ? 'published' : 'draft'}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Announcement Section */}
          <div className="announcement-section">
            <h2>📢 Platform Announcement</h2>
            <p className="section-description">Send announcements to students enrolled in any course</p>

            <div className="announcement-form-container">
              <div className="form-group">
                <label htmlFor="announcementCourse">Select Course</label>
                <select
                  id="announcementCourse"
                  className="announcement-select"
                  value={selectedCourseForAnnouncement}
                  onChange={(e) => setSelectedCourseForAnnouncement(e.target.value)}
                >
                  <option value="">-- Select a course --</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.studentsEnrolled?.length || 0} students)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="announcementTitle">Announcement Title</label>
                <input
                  type="text"
                  id="announcementTitle"
                  placeholder="Enter announcement title..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="announcementMessage">Message</label>
                <textarea
                  id="announcementMessage"
                  placeholder="Write your announcement message here..."
                  rows="4"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!selectedCourseForAnnouncement || !announcementTitle || !announcementMessage) {
                    alert('Please fill in all fields');
                    return;
                  }

                  setAnnouncementLoading(true);
                  try {
                    await axios.post(`/api/courses/${selectedCourseForAnnouncement}/announcements`, {
                      title: announcementTitle,
                      message: announcementMessage
                    }, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                      }
                    });

                    alert('Announcement sent successfully! All enrolled students will be notified.');
                    setAnnouncementTitle('');
                    setAnnouncementMessage('');
                    setSelectedCourseForAnnouncement('');
                  } catch (err) {
                    console.error(err);
                    alert(err.response?.data?.message || 'Failed to send announcement');
                  } finally {
                    setAnnouncementLoading(false);
                  }
                }}
                disabled={announcementLoading || !selectedCourseForAnnouncement || !announcementTitle || !announcementMessage}
              >
                {announcementLoading ? 'Sending...' : '📣 Send Announcement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;