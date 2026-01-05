import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from './DarkModeToggle';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Intelli<span>Learn</span>
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/courses" className="nav-link">
              Courses
            </Link>
          </li>

          {user ? (
            <>
              {user?.role === 'student' && (
                <>
                  <li className="nav-item">
                    <Link to="/student/dashboard" className="nav-link">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/student-progress" className="nav-link">
                      My Progress
                    </Link>
                  </li>
                </>
              )}
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin/dashboard" className="nav-link">
                    Admin Panel
                  </Link>
                </li>
              )}
              {user?.role === 'instructor' && (
                <li className="nav-item">
                  <Link to="/instructor/dashboard" className="nav-link">
                    Instructor Panel
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <span className="nav-welcome">
                  Welcome, {user.name}
                </span>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </li>
            </>
          )}
          {user && (
            <li className="nav-item">
              <NotificationDropdown />
            </li>
          )}
          <li className="nav-item">
            <DarkModeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;