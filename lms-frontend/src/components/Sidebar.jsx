import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Common navigation items for all roles
  const commonNavItems = [
    { path: '/courses', label: 'Browse Courses', icon: '📚' },
  ];

  // Role-specific navigation items
  const roleNavItems = {
    admin: [
      { path: '/admin/dashboard', label: 'Admin Dashboard', icon: '🖥️' },
      { path: '/admin/users', label: 'Manage Users', icon: '👥' },
      { path: '/admin/reports', label: 'Reports', icon: '📈' },
    ],
    instructor: [
      { path: '/instructor/dashboard', label: 'Instructor Dashboard', icon: '🖥️' },
      { path: '/instructor/courses', label: 'My Courses', icon: '📚' },
      { path: '/instructor/create-course', label: 'Create Course', icon: '➕' },
    ],
    student: [
      { path: '/student/dashboard', label: 'Student Dashboard', icon: '🖥️' },
      { path: '/student-progress', label: 'My Progress', icon: '📊' },
      { path: '/payment-history', label: 'Payment History', icon: '💳' },
    ]
  };

  const currentRoleItems = user ? roleNavItems[user.role] || [] : [];
  const allNavItems = [...commonNavItems, ...currentRoleItems];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Navigation</h3>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {allNavItems.map((item, index) => (
            <li key={index} className="sidebar-item">
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;