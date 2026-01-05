import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Loading from '../components/Loading';

const RoleDashboard = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'instructor':
      return <Navigate to="/instructor/dashboard" />;
    case 'student':
    default:
      return <Navigate to="/student/dashboard" />;
  }
};

export default RoleDashboard;