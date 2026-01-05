import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on app load
  useEffect(() => {
    loadUser();
  }, []);

  // Load user
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUser(res.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      setIsAuthenticated(true);
      
      return res.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('/api/auth/login', userData);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      setIsAuthenticated(true);
      
      return res.data; // Return the user data including role
    } catch (err) {
      throw err.response.data;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Context values
  const contextValues = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    loadUser
  };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;