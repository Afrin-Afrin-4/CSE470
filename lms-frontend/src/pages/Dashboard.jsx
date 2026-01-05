import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated, loadUser } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadUser();
      fetchDashboardData();
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Filter courses based on search term
    if (searchTerm) {
      const filtered = enrolledCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(enrolledCourses);
    }
  }, [searchTerm, enrolledCourses]);

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const coursesRes = await axios.get('/api/users/me/courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch progress data
      const progressRes = await axios.get('/api/progress', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch notifications
      const notificationsRes = await axios.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch payment history
      const paymentsRes = await axios.get('/api/payments/history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Process recent activity
      const activity = [];
      progressRes.data.data.forEach(progress => {
        if (progress.lastUpdated) {
          activity.push({
            id: progress.course._id,
            title: `Progress updated in ${progress.course.title}`,
            time: new Date(progress.lastUpdated).toLocaleString(),
            type: 'progress'
          });
        }
      });

      // Process upcoming deadlines (assignments, quizzes, etc.)
      const deadlines = [];
      coursesRes.data.data.forEach(course => {
        if (course.assignments) {
          course.assignments.forEach(assignment => {
            if (assignment.dueDate && new Date(assignment.dueDate) > new Date()) {
              deadlines.push({
                id: assignment._id,
                title: assignment.title,
                course: course.title,
                dueDate: new Date(assignment.dueDate),
                type: 'assignment'
              });
            }
          });
        }
        if (course.quizzes) {
          course.quizzes.forEach(quiz => {
            if (quiz.dueDate && new Date(quiz.dueDate) > new Date()) {
              deadlines.push({
                id: quiz._id,
                title: quiz.title,
                course: course.title,
                dueDate: new Date(quiz.dueDate),
                type: 'quiz'
              });
            }
          });
        }

        // Add course enrollment deadlines
        if (course.enrollmentDeadline && new Date(course.enrollmentDeadline) > new Date()) {
          deadlines.push({
            id: course._id,
            title: `Enrollment Deadline: ${course.title}`,
            course: course.title,
            dueDate: new Date(course.enrollmentDeadline),
            type: 'enrollment'
          });
        }
      });

      // Sort deadlines by due date
      deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      setEnrolledCourses(coursesRes.data.data);
      setFilteredCourses(coursesRes.data.data);
      setProgressData(progressRes.data.data);
      setRecentActivity(activity.slice(0, 5)); // Last 5 activities
      setUpcomingDeadlines(deadlines.slice(0, 5)); // Next 5 deadlines
      setNotifications(notificationsRes.data.data.slice(0, 5)); // Last 5 notifications
      setPaymentHistory(paymentsRes.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getCourseProgress = (courseId) => {
    const progress = progressData.find(p => p.course._id === courseId);
    return progress ? progress.overallProgress : 0;
  };

  const getOverallProgress = () => {
    if (progressData.length === 0) return 0;
    const totalProgress = progressData.reduce((sum, p) => sum + p.overallProgress, 0);
    return Math.round(totalProgress / progressData.length);
  };

  const getCompletedCoursesCount = () => {
    return progressData.filter(p => p.completedAt).length;
  };

  if (!isAuthenticated) {
    return null;
  }



  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Student Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div>
            <button className="btn" onClick={() => navigate('/courses')}>
              Browse Courses
            </button>
          </div>
        </div>

        <div className="welcome-banner">
          <h2>Continue Your Learning Journey</h2>
          <p>Track your progress, complete assignments, and achieve your educational goals.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{enrolledCourses.length}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">
              {getCompletedCoursesCount()}
            </div>
            <div className="stat-label">Completed Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">
              {getOverallProgress()}%
            </div>
            <div className="stat-label">Avg. Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-value">
              {notifications.filter(n => !n.isRead).length}
            </div>
            <div className="stat-label">Unread Notifications</div>
          </div>
        </div>

        {/* Progress Overview Section */}
        <div className="progress-overview">
          <h2 className="section-title">Your Learning Progress</h2>
          <div className="progress-charts">
            <div className="progress-chart-card">
              <h3>Overall Progress</h3>
              <div className="circular-progress">
                <div className="circular-progress-value">{getOverallProgress()}%</div>
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="2"
                  />
                  <path className="circle"
                    strokeDasharray={`${getOverallProgress()}, 100`}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4361ee" />
                      <stop offset="100%" stopColor="#3a0ca3" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="progress-chart-card">
              <h3>Course Completion</h3>
              <div className="completion-stats">
                <div className="completion-item">
                  <span className="completion-label">Completed</span>
                  <div className="completion-bar">
                    <div
                      className="completion-fill completed"
                      style={{ width: `${(getCompletedCoursesCount() / enrolledCourses.length) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <span className="completion-value">{getCompletedCoursesCount()}</span>
                </div>
                <div className="completion-item">
                  <span className="completion-label">In Progress</span>
                  <div className="completion-bar">
                    <div
                      className="completion-fill in-progress"
                      style={{ width: `${((enrolledCourses.length - getCompletedCoursesCount()) / enrolledCourses.length) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <span className="completion-value">{enrolledCourses.length - getCompletedCoursesCount()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-search">
          <input
            type="text"
            placeholder="Search your enrolled courses..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h2 className="section-title">Your Enrolled Courses</h2>

        {loading ? (
          <p>Loading your courses...</p>
        ) : filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const progress = getCourseProgress(course._id);
              return (
                <div key={course._id} className="course-card">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/300x200/4361ee/ffffff?text=Course+Image'}
                    alt={course.title}
                    className="course-image"
                  />
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description.substring(0, 100)}...</p>

                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="course-actions">
                      <Link to={`/courses/${course._id}`} className="btn">
                        Continue Learning
                      </Link>
                      <Link to={`/student/attendance/${course._id}`} className="btn btn-outline">
                        View Attendance
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-courses">
            <h3>No Enrolled Courses Found</h3>
            <p>We couldn't find any courses matching your search. Try adjusting your search term.</p>
            <button className="btn" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Recent Activity Section */}
          <div className="activity-section">
            <h2>Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <ul className="activity-list">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'progress' ? '📊' : '📝'}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>Course activity</p>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-activity">No recent activity</p>
            )}
          </div>

          {/* Upcoming Deadlines Section */}
          <div className="deadlines-section">
            <h2>Upcoming Deadlines</h2>
            {upcomingDeadlines.length > 0 ? (
              <ul className="deadlines-list">
                {upcomingDeadlines.map((deadline, index) => (
                  <li key={index} className="deadline-item">
                    <div className="deadline-icon">
                      {deadline.type === 'assignment' ? '📝' : '❓'}
                    </div>
                    <div className="deadline-content">
                      <h4>{deadline.title}</h4>
                      <p>{deadline.course}</p>
                    </div>
                    <div className="deadline-date">
                      {deadline.dueDate.toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-deadlines">No upcoming deadlines</p>
            )}
          </div>

          {/* Payment History Section */}
          <div className="payment-history-section" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Payment History</h2>
            {paymentHistory.length > 0 ? (
              <div className="payment-list" style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Course</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Amount</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 500 }}>{payment.course?.title || 'N/A'}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#10b981', fontWeight: 600 }}>${payment.amount?.toFixed(2)}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: payment.status === 'completed' ? '#dcfce7' : payment.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: payment.status === 'completed' ? '#166534' : payment.status === 'pending' ? '#92400e' : '#991b1b'
                          }}>
                            {payment.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', color: '#64748b' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-payments" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', background: '#f8fafc', borderRadius: '12px' }}>No payment history found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;